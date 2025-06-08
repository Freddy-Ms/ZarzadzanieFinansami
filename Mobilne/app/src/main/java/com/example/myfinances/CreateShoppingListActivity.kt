package com.example.myfinances

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Spinner
import androidx.appcompat.app.AppCompatActivity
import android.widget.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class CreateShoppingListActivity : AppCompatActivity() {

    private lateinit var listNameEditText: EditText
    private lateinit var householdSpinner: Spinner
    private lateinit var productsContainer: LinearLayout
    private lateinit var addProductButton: Button
    private lateinit var saveListButton: Button

    private val householdList = mutableListOf<Pair<Int, String>>()
    private val unitList = mutableListOf<Pair<Int, String>>()
    private val subcategoryList = mutableListOf<Pair<Int, String>>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_shopping_list)

        listNameEditText = findViewById(R.id.listNameEditText)
        householdSpinner = findViewById(R.id.householdSpinner)
        productsContainer = findViewById(R.id.productsContainer)
        addProductButton = findViewById(R.id.addProductButton)
        saveListButton = findViewById(R.id.saveListButton)

        val dataLoader = LoadData(
            context = this,
            unitList = unitList,
            subcategoryList = subcategoryList,
            householdList = householdList,
            householdSpinner = householdSpinner,
        )

        dataLoader.loadUnits()
        dataLoader.loadSubcategories()
        dataLoader.loadHouseholds()

        renderProductItem()
        addProductButton.setOnClickListener { renderProductItem() }

        saveListButton.setOnClickListener { saveShoppingList() }
    }

    private fun renderProductItem() {
        val itemView = layoutInflater.inflate(R.layout.item_shopping_product, productsContainer, false)

        val unitSpinner = itemView.findViewById<Spinner>(R.id.unitSpinner)
        val subcategorySpinner = itemView.findViewById<Spinner>(R.id.subcategorySpinner)

        unitSpinner.adapter = ArrayAdapter(this, R.layout.spinner_item, unitList.map { it.second })
        subcategorySpinner.adapter = ArrayAdapter(this, R.layout.spinner_item, subcategoryList.map { it.second })

        productsContainer.addView(itemView)
    }

    private fun saveShoppingList() {
        val listName = listNameEditText.text.toString().trim()
        val householdId = householdList.getOrNull(householdSpinner.selectedItemPosition)?.first
            ?.takeIf { it != -1 }

        if (listName.isEmpty()) {
            Toast.makeText(this, "Enter list name", Toast.LENGTH_SHORT).show()
            return
        }

        val listBody = JSONObject().apply {
            put("name", listName)
            householdId?.let { put("household_id", it) }
        }

        val createRequest = Request.Builder()
            .url("$BASE_URL/shoppinglist/create")
            .post(listBody.toString().toRequestBody("application/json".toMediaTypeOrNull()))
            .build()

        ApiClient.client.newCall(createRequest).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@CreateShoppingListActivity, "Failed: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    val listId = JSONObject(responseBody).optInt("id", -1)

                    if (listId != -1) {
                        sendProducts(listId)
                    } else {
                        runOnUiThread {
                            Toast.makeText(this@CreateShoppingListActivity, "List ID not returned", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
                 else {
                        runOnUiThread {
                            Toast.makeText(this@CreateShoppingListActivity, "List creation failed", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
        })
    }

    private fun sendProducts(listId: Int) {
        for (i in 0 until productsContainer.childCount) {
            val itemView = productsContainer.getChildAt(i)

            val name = itemView.findViewById<EditText>(R.id.productNameEditText).text.toString().trim()
            val quantity = itemView.findViewById<EditText>(R.id.productQuantityEditText).text.toString().toDoubleOrNull() ?: 1.0
            val unitId = unitList.getOrNull(itemView.findViewById<Spinner>(R.id.unitSpinner).selectedItemPosition)?.first
            val subcategoryId = subcategoryList.getOrNull(itemView.findViewById<Spinner>(R.id.subcategorySpinner).selectedItemPosition)?.first

            val json = JSONObject().apply {
                put("list_id", listId)
                put("name", name)
                put("quantity", quantity)
                put("unit_id", unitId)
                put("subcategory_id", subcategoryId)
            }

            val request = Request.Builder()
                .url("$BASE_URL/shoppinglist/product/add")
                .post(json.toString().toRequestBody("application/json".toMediaTypeOrNull()))
                .build()

            ApiClient.client.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    runOnUiThread {
                        Toast.makeText(this@CreateShoppingListActivity, "Failed to add product", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onResponse(call: Call, response: Response) {
                    runOnUiThread {
                        if (response.isSuccessful) {
                            Toast.makeText(this@CreateShoppingListActivity, "Shopping list created", Toast.LENGTH_SHORT).show()
                            finish()
                        } else {
                            Toast.makeText(this@CreateShoppingListActivity, "Failed to add product", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            })
        }
    }

}
