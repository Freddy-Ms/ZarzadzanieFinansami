package com.example.myfinances

import android.annotation.SuppressLint
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class EditShoppingListActivity : AppCompatActivity() {

    private lateinit var listNameTextView: TextView
    private lateinit var productsContainer: LinearLayout
    private lateinit var addProductButton: Button

    private var listId: Int = -1

    private val unitList = mutableListOf<Pair<Int, String>>()
    private val subcategoryList = mutableListOf<Pair<Int, String>>()

    private val unitListWithUncategorized: List<Pair<Int?, String>>
        get() = listOf(null to "Uncategorized") + unitList

    private val subcategoryListWithUncategorized: List<Pair<Int?, String>>
        get() = listOf(null to "Uncategorized") + subcategoryList

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_edit_shopping_list)

        listId = intent.getIntExtra("list_id", -1)
        if (listId == -1) {
            Toast.makeText(this, "No list ID passed", Toast.LENGTH_SHORT).show()
            finish(); return
        }

        listNameTextView = findViewById(R.id.listNameTextView)
        productsContainer = findViewById(R.id.productsContainer)
        addProductButton = findViewById(R.id.addProductButton)

        addProductButton.setOnClickListener {
            renderNewProductItem()
        }

        LoadData(
            context = this,
            unitList = unitList,
            subcategoryList = subcategoryList,
            onComplete = { loadListDetails() }
        ).apply {
            loadUnits()
            loadSubcategories()
        }
    }

    private fun loadListDetails() {
        val req = Request.Builder()
            .url("$BASE_URL/shoppinglist/get")
            .get()
            .build()

        ApiClient.client.newCall(req).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@EditShoppingListActivity, "Load failed", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val arr = JSONArray(response.body?.string() ?: "[]")
                val found = (0 until arr.length()).map { arr.getJSONObject(it) }.find { it.getInt("id") == listId }

                found?.let {
                    val listName = it.optString("name", "")
                    val prodArr = it.optJSONArray("products") ?: JSONArray()

                    runOnUiThread {
                        listNameTextView.text = listName
                        productsContainer.removeAllViews()
                        for (i in 0 until prodArr.length()) {
                            renderProductEditable(prodArr.getJSONObject(i))
                        }
                    }
                } ?: runOnUiThread {
                    Toast.makeText(this@EditShoppingListActivity, "List not found", Toast.LENGTH_SHORT).show()
                    finish()
                }
            }
        })
    }

    @SuppressLint("SetTextI18n")
    private fun renderProductEditable(product: JSONObject) {
        val itemView = layoutInflater.inflate(R.layout.item_shopping_product_editable, productsContainer, false)

        val nameEdit = itemView.findViewById<EditText>(R.id.productNameEditText)
        val qtyEdit = itemView.findViewById<EditText>(R.id.productQuantityEditText)
        val unitSpinner = itemView.findViewById<Spinner>(R.id.unitSpinner)
        val subSpinner = itemView.findViewById<Spinner>(R.id.subcategorySpinner)
        val saveBtn = itemView.findViewById<Button>(R.id.saveButton)
        val removeBtn = itemView.findViewById<Button>(R.id.removeButton)

        val productId = product.optInt("id")
        nameEdit.setText(product.optString("name"))
        qtyEdit.setText(product.optDouble("quantity", 1.0).toString())

        unitSpinner.adapter = ArrayAdapter(this, R.layout.spinner_item, unitListWithUncategorized.map { it.second })
        subSpinner.adapter = ArrayAdapter(this, R.layout.spinner_item, subcategoryListWithUncategorized.map { it.second })

        unitSpinner.setSelection(unitListWithUncategorized.indexOfFirst { it.first == product.opt("unit_id") })
        subSpinner.setSelection(subcategoryListWithUncategorized.indexOfFirst { it.first == product.opt("subcategory_id") })

        saveBtn.setOnClickListener {
            val json = JSONObject().apply {
                put("id", productId)
                put("name", nameEdit.text.toString().trim())
                put("quantity", qtyEdit.text.toString().toDoubleOrNull() ?: 1.0)
                put("unit_id", unitListWithUncategorized[unitSpinner.selectedItemPosition].first)
                put("subcategory_id", subcategoryListWithUncategorized[subSpinner.selectedItemPosition].first)
            }

            val req = Request.Builder()
                .url("$BASE_URL/shoppinglist/product/edit")
                .post(json.toString().toRequestBody("application/json".toMediaTypeOrNull()))
                .build()

            ApiClient.client.newCall(req).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    runOnUiThread { Toast.makeText(this@EditShoppingListActivity, "Update failed", Toast.LENGTH_SHORT).show() }
                }
                override fun onResponse(call: Call, response: Response) {
                    runOnUiThread { Toast.makeText(this@EditShoppingListActivity, "Product updated", Toast.LENGTH_SHORT).show() }
                }
            })
        }

        removeBtn.setOnClickListener {
            val req = Request.Builder()
                .url("$BASE_URL/shoppinglist/product/remove")
                .post(JSONObject().put("id", productId).toString().toRequestBody("application/json".toMediaTypeOrNull()))
                .build()

            ApiClient.client.newCall(req).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    runOnUiThread { Toast.makeText(this@EditShoppingListActivity, "Delete failed", Toast.LENGTH_SHORT).show() }
                }
                override fun onResponse(call: Call, response: Response) {
                    runOnUiThread {
                        if (response.isSuccessful) {
                            productsContainer.removeView(itemView)
                            Toast.makeText(this@EditShoppingListActivity, "Product removed", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            })
        }

        productsContainer.addView(itemView)
    }

    private fun renderNewProductItem() {
        val itemView = layoutInflater.inflate(R.layout.item_shopping_product_editable, productsContainer, false)

        val nameEdit = itemView.findViewById<EditText>(R.id.productNameEditText)
        val qtyEdit = itemView.findViewById<EditText>(R.id.productQuantityEditText)
        val unitSpinner = itemView.findViewById<Spinner>(R.id.unitSpinner)
        val subSpinner = itemView.findViewById<Spinner>(R.id.subcategorySpinner)
        val saveBtn = itemView.findViewById<Button>(R.id.saveButton)
        val removeBtn = itemView.findViewById<Button>(R.id.removeButton)

        unitSpinner.adapter = ArrayAdapter(this, R.layout.spinner_item, unitListWithUncategorized.map { it.second })
        subSpinner.adapter = ArrayAdapter(this, R.layout.spinner_item, subcategoryListWithUncategorized.map { it.second })

        unitSpinner.setSelection(0)
        subSpinner.setSelection(0)

        saveBtn.setOnClickListener {
            val json = JSONObject().apply {
                put("list_id", listId)
                put("name", nameEdit.text.toString().trim())
                put("quantity", qtyEdit.text.toString().toDoubleOrNull() ?: 1.0)
                put("unit_id", unitListWithUncategorized[unitSpinner.selectedItemPosition].first)
                put("subcategory_id", subcategoryListWithUncategorized[subSpinner.selectedItemPosition].first)
            }

            val req = Request.Builder()
                .url("$BASE_URL/shoppinglist/product/add")
                .post(json.toString().toRequestBody("application/json".toMediaTypeOrNull()))
                .build()

            ApiClient.client.newCall(req).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    runOnUiThread { Toast.makeText(this@EditShoppingListActivity, "Add failed", Toast.LENGTH_SHORT).show() }
                }
                override fun onResponse(call: Call, response: Response) {
                    runOnUiThread {
                        if (response.isSuccessful) {
                            Toast.makeText(this@EditShoppingListActivity, "Product added", Toast.LENGTH_SHORT).show()
                            productsContainer.removeView(itemView)
                            loadListDetails()
                        }
                    }
                }
            })
        }

        removeBtn.setOnClickListener {
            productsContainer.removeView(itemView)
        }

        productsContainer.addView(itemView)
    }
}