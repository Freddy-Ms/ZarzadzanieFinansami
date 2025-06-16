package com.example.myfinances

import android.annotation.SuppressLint
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.myfinances.ApiClient.client
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class EditPurchaseActivity : AppCompatActivity() {

    private lateinit var purchaseNameEditText: EditText
    private lateinit var productsContainer: LinearLayout
    private lateinit var addProductButton: Button
    private lateinit var saveNameButton: Button


    private var purchaseId: Int = -1

    private val unitList = mutableListOf<Pair<Int, String>>()
    private val subcategoryList = mutableListOf<Pair<Int, String>>()

    private val unitListWithUncategorized: List<Pair<Int?, String>>
        get() = listOf(null to "Uncategorized") + unitList

    private val subcategoryListWithUncategorized: List<Pair<Int?, String>>
        get() = listOf(null to "Uncategorized") + subcategoryList

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_edit_purchase)

        purchaseId = intent.getIntExtra("purchase_id", -1)
        if (purchaseId == -1) {
            Toast.makeText(this, "No purchase ID passed", Toast.LENGTH_SHORT).show()
            finish(); return
        }

        purchaseNameEditText = findViewById(R.id.purchaseNameEditText)
        productsContainer = findViewById(R.id.productsContainer)
        addProductButton = findViewById(R.id.addProductButton)

        addProductButton.setOnClickListener { renderNewProductItem() }

        LoadData(
            context = this,
            unitList = unitList,
            subcategoryList = subcategoryList,
            onComplete = { loadPurchaseDetails() }
        ).apply {
            loadUnits()
            loadSubcategories()
        }
        saveNameButton = findViewById(R.id.saveNameButton)

        saveNameButton.setOnClickListener {
            savePurchaseName()
        }

    }
    private fun savePurchaseName(){
        val newName = purchaseNameEditText.text.toString().trim()
        val json = JSONObject().apply {
            put("event_id", purchaseId)
            put("name", newName)
        }

        val req = Request.Builder()
            .url("$BASE_URL/purchaseevent/edit")
            .post(json.toString().toRequestBody("application/json".toMediaTypeOrNull()))
            .build()

        client.newCall(req).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@EditPurchaseActivity, "Name update failed", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    if (response.isSuccessful) {
                        Toast.makeText(this@EditPurchaseActivity, "Name updated", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this@EditPurchaseActivity, "Update failed: ${response.code}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }

    private fun loadPurchaseDetails() {
        val json = JSONObject().put("event_id", purchaseId)
        val req = Request.Builder()
            .url("$BASE_URL/purchaseevent/get")
            .post(json.toString().toRequestBody("application/json".toMediaTypeOrNull()))
            .build()

        client.newCall(req).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@EditPurchaseActivity, "Load failed", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val body = response.body?.string() ?: return
                val event = JSONObject(body).optJSONArray("events")?.optJSONObject(0) ?: return

                val name = event.optString("name", "")
                val products = event.optJSONArray("products") ?: JSONArray()

                runOnUiThread {
                    purchaseNameEditText.setText(name)
                    productsContainer.removeAllViews()
                    for (i in 0 until products.length()) {
                        renderProductEditable(products.getJSONObject(i))
                    }
                }
            }
        })
    }

    @SuppressLint("SetTextI18n")
    private fun renderProductEditable(product: JSONObject) {
        val itemView = layoutInflater.inflate(R.layout.item_purchase_product_editable, productsContainer, false)

        val nameEdit = itemView.findViewById<EditText>(R.id.productNameEditText)
        val qtyEdit = itemView.findViewById<EditText>(R.id.productQuantityEditText)
        val priceEdit = itemView.findViewById<EditText>(R.id.productPriceEditText)
        val unitSpinner = itemView.findViewById<Spinner>(R.id.unitSpinner)
        val subSpinner = itemView.findViewById<Spinner>(R.id.subcategorySpinner)
        val saveBtn = itemView.findViewById<Button>(R.id.saveButton)
        val removeBtn = itemView.findViewById<Button>(R.id.removeButton)

        val productId = product.getInt("id")

        nameEdit.setText(product.optString("name"))
        qtyEdit.setText(product.optDouble("quantity", 1.0).toString())
        priceEdit.setText(product.optString("price", "0.00"))

        unitSpinner.adapter = ArrayAdapter(this, R.layout.spinner_item, unitListWithUncategorized.map { it.second })
        subSpinner.adapter = ArrayAdapter(this, R.layout.spinner_item, subcategoryListWithUncategorized.map { it.second })

        unitSpinner.setSelection(unitListWithUncategorized.indexOfFirst { it.first == product.opt("unit_id") })
        subSpinner.setSelection(subcategoryListWithUncategorized.indexOfFirst { it.first == product.opt("subcategory_id") })

        saveBtn.setOnClickListener {
            val json = JSONObject().apply {
                put("id", productId)
                put("name", nameEdit.text.toString().trim())
                put("quantity", qtyEdit.text.toString().toDoubleOrNull() ?: 1.0)
                put("price", priceEdit.text.toString().toDoubleOrNull() ?: 0.0)
                put("unit_id", unitListWithUncategorized[unitSpinner.selectedItemPosition].first)
                put("subcategory_id", subcategoryListWithUncategorized[subSpinner.selectedItemPosition].first)
            }

            val req = Request.Builder()
                .url("$BASE_URL/purchaseevent/product/edit")
                .post(json.toString().toRequestBody("application/json".toMediaTypeOrNull()))
                .build()

            client.newCall(req).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    runOnUiThread { Toast.makeText(this@EditPurchaseActivity, "Update failed", Toast.LENGTH_SHORT).show() }
                }

                override fun onResponse(call: Call, response: Response) {
                    runOnUiThread { Toast.makeText(this@EditPurchaseActivity, "Product updated", Toast.LENGTH_SHORT).show() }
                }
            })
        }

        removeBtn.setOnClickListener {
            val req = Request.Builder()
                .url("$BASE_URL/purchaseevent/product/remove")
                .post(JSONObject().put("id", productId).toString().toRequestBody("application/json".toMediaTypeOrNull()))
                .build()

            client.newCall(req).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    runOnUiThread { Toast.makeText(this@EditPurchaseActivity, "Delete failed", Toast.LENGTH_SHORT).show() }
                }

                override fun onResponse(call: Call, response: Response) {
                    if (response.isSuccessful) {
                        runOnUiThread {
                            productsContainer.removeView(itemView)
                            Toast.makeText(this@EditPurchaseActivity, "Product removed", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            })
        }

        productsContainer.addView(itemView)
    }

    private fun renderNewProductItem() {
        val itemView = layoutInflater.inflate(R.layout.item_purchase_product_editable, productsContainer, false)

        val nameEdit = itemView.findViewById<EditText>(R.id.productNameEditText)
        val qtyEdit = itemView.findViewById<EditText>(R.id.productQuantityEditText)
        val priceEdit = itemView.findViewById<EditText>(R.id.productPriceEditText)
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
                put("event_id", purchaseId)
                put("name", nameEdit.text.toString().trim())
                put("quantity", qtyEdit.text.toString().toDoubleOrNull() ?: 1.0)
                put("price", priceEdit.text.toString().toDoubleOrNull() ?: 0.0)
                put("unit_id", unitListWithUncategorized[unitSpinner.selectedItemPosition].first)
                put("subcategory_id", subcategoryListWithUncategorized[subSpinner.selectedItemPosition].first)
            }

            val req = Request.Builder()
                .url("$BASE_URL/purchaseevent/product/add")
                .post(json.toString().toRequestBody("application/json".toMediaTypeOrNull()))
                .build()

            client.newCall(req).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    runOnUiThread { Toast.makeText(this@EditPurchaseActivity, "Add failed", Toast.LENGTH_SHORT).show() }
                }

                override fun onResponse(call: Call, response: Response) {
                    runOnUiThread {
                        if (response.isSuccessful) {
                            Toast.makeText(this@EditPurchaseActivity, "Product added", Toast.LENGTH_SHORT).show()
                            productsContainer.removeView(itemView)
                            loadPurchaseDetails()
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
