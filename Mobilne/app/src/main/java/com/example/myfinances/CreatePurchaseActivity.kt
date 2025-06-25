package com.example.myfinances

import android.graphics.BitmapFactory
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.myfinances.ApiClient.client
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.IOException

class CreatePurchaseActivity : AppCompatActivity() {

    private lateinit var receiptImageView: ImageView
    private lateinit var productListLayout: LinearLayout
    private lateinit var saveButton: Button
    private lateinit var purchaseNameInput: EditText
    private lateinit var householdSpinner: Spinner
    private lateinit var addProductButton: Button


    private lateinit var productArray: JSONArray
    private lateinit var photoFile: File

    private val unitsList = mutableListOf<Pair<Int, String>>()
    private val subcategoryList = mutableListOf<Pair<Int, String>>()
    private val householdList = mutableListOf<Pair<Int, String>>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_purchase)

        receiptImageView = findViewById(R.id.receiptImageView)
        productListLayout = findViewById(R.id.productListLayout)
        saveButton = findViewById(R.id.savePurchaseButton)
        purchaseNameInput = findViewById(R.id.purchaseNameInput)
        householdSpinner = findViewById(R.id.householdSpinner)

        val productJson = intent.getStringExtra("ocrProducts")
        val photoPath = intent.getStringExtra("photoPath")

        if (productJson == null || photoPath == null) {
            Toast.makeText(this, "Missing data", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        productArray = JSONArray(productJson)
        photoFile = File(photoPath)

        showReceiptPhoto(photoFile)
        val dataLoader = LoadData(
            context = this,
            unitList = unitsList,
            subcategoryList = subcategoryList,
            householdList = householdList,
            householdSpinner = householdSpinner,
            onComplete = { renderProductFields(productArray) }
        )
        dataLoader.loadUnits()
        dataLoader.loadSubcategories()
        dataLoader.loadHouseholds()

        renderProductFields(productArray)

        saveButton.setOnClickListener {
            savePurchase()
        }
        addProductButton = findViewById(R.id.addProductButton)
        addProductButton.setOnClickListener {
            addEmptyProductField()
        }

    }

    private fun showReceiptPhoto(file: File) {
        if (file.exists()) {
            val bitmap = BitmapFactory.decodeFile(file.absolutePath)
            receiptImageView.setImageBitmap(bitmap)
        }
    }

    private fun renderProductFields(products: JSONArray) {
        productListLayout.removeAllViews()

        for (i in 0 until products.length()) {
            val product = products.getJSONObject(i)

            val itemView = layoutInflater.inflate(R.layout.item_product_editable, productListLayout, false)

            val nameInput = itemView.findViewById<EditText>(R.id.productNameEditText)
            val quantityInput = itemView.findViewById<EditText>(R.id.productQuantityEditText)
            val priceInput = itemView.findViewById<EditText>(R.id.priceEditText)
            val unitSpinner = itemView.findViewById<Spinner>(R.id.unitSpinner)
            val subcategorySpinner = itemView.findViewById<Spinner>(R.id.subcategorySpinner)
            val removeButton = itemView.findViewById<Button>(R.id.removeProductButton)

            nameInput.setText(product.getString("name"))
            quantityInput.setText(product.optDouble("quantity", 1.0).toString())
            priceInput.setText(product.getDouble("price").toString())

            val unitsListWithNull = listOf(null to "Uncategorized") + unitsList
            val subcategoryListWithNull = listOf(null to "Uncategorized") + subcategoryList

            unitSpinner.adapter = ArrayAdapter(
                this,
                R.layout.spinner_item,
                unitsListWithNull.map { it.second }
            )
            subcategorySpinner.adapter = ArrayAdapter(
                this,
                R.layout.spinner_item,
                subcategoryListWithNull.map { it.second }
            )

            val unitIdFromBackend = product.optInt("unit_id", -1)
            val subcategoryIdFromBackend = product.optInt("subcategory_id", -1)

            val unitIndex = unitsListWithNull.indexOfFirst { it.first == unitIdFromBackend }
            val subcategoryIndex = subcategoryListWithNull.indexOfFirst { it.first == subcategoryIdFromBackend }

            unitSpinner.setSelection(if (unitIndex >= 0) unitIndex else 0)
            subcategorySpinner.setSelection(if (subcategoryIndex >= 0) subcategoryIndex else 0)

            removeButton.setOnClickListener {
                productListLayout.removeView(itemView)
            }

            productListLayout.addView(itemView)
        }
    }


    private fun savePurchase() {
        val purchaseName = purchaseNameInput.text.toString().trim()
        val selected = householdList.getOrNull(householdSpinner.selectedItemPosition)
        val selectedHouseholdId = if (selected?.first == -1) null else selected?.first

        if (purchaseName.isEmpty()) {
            Toast.makeText(this, "Enter purchase name", Toast.LENGTH_SHORT).show()
            return
        }

        val productJsonArray = JSONArray()

        for (i in 0 until productListLayout.childCount) {
            val itemView = productListLayout.getChildAt(i)

            val name = itemView.findViewById<EditText>(R.id.productNameEditText).text.toString().trim()
            val quantity = itemView.findViewById<EditText>(R.id.productQuantityEditText).text.toString()
                .toDoubleOrNull() ?: 1.0
            val price = itemView.findViewById<EditText>(R.id.priceEditText).text.toString()
                .toDoubleOrNull() ?: 0.00

            val unitSpinner = itemView.findViewById<Spinner>(R.id.unitSpinner)
            val subcategorySpinner = itemView.findViewById<Spinner>(R.id.subcategorySpinner)

            val unitPosition = unitSpinner.selectedItemPosition
            val subcategoryPosition = subcategorySpinner.selectedItemPosition

            val unitsListWithUncategorized = listOf(null to "Uncategorized") + unitsList
            val subcategoryListWithUncategorized = listOf(null to "Uncategorized") + subcategoryList

            val unitId = unitsListWithUncategorized.getOrNull(unitPosition)?.first
            val subcategoryId = subcategoryListWithUncategorized.getOrNull(subcategoryPosition)?.first

            val obj = JSONObject()
            obj.put("name", name)
            obj.put("quantity", quantity)
            obj.put("price", price)
            obj.put("unit_id", unitId)
            obj.put("subcategory_id", subcategoryId)

            productJsonArray.put(obj)
        }

        val builder = MultipartBody.Builder().setType(MultipartBody.FORM)
            .addFormDataPart("name", purchaseName)
            .addFormDataPart("products", productJsonArray.toString())
            .addFormDataPart(
                "receipt",
                photoFile.name,
                photoFile.asRequestBody("image/jpeg".toMediaTypeOrNull())
            )

        selectedHouseholdId?.let {
            builder.addFormDataPart("household_id", it.toString())
        }

        val request = Request.Builder()
            .url("$BASE_URL/purchaseevent/create")
            .post(builder.build())
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(
                        this@CreatePurchaseActivity,
                        "Upload failed: ${e.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    if (response.isSuccessful) {
                        Toast.makeText(
                            this@CreatePurchaseActivity,
                            "Purchase saved",
                            Toast.LENGTH_SHORT
                        ).show()
                        finish()
                    } else {
                        Toast.makeText(
                            this@CreatePurchaseActivity,
                            "Error: ${response.code}",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }
            }
        })
    }


    private fun addEmptyProductField() {
        val itemView = layoutInflater.inflate(R.layout.item_product_editable, productListLayout, false)

        val unitSpinner = itemView.findViewById<Spinner>(R.id.unitSpinner)
        val subcategorySpinner = itemView.findViewById<Spinner>(R.id.subcategorySpinner)
        val removeButton = itemView.findViewById<Button>(R.id.removeProductButton)

        val unitsListWithNull = listOf(null to "Uncategorized") + unitsList
        val subcategoryListWithNull = listOf(null to "Uncategorized") + subcategoryList

        unitSpinner.adapter = ArrayAdapter(
            this,
            R.layout.spinner_item,
            unitsListWithNull.map { it.second }
        )

        subcategorySpinner.adapter = ArrayAdapter(
            this,
            R.layout.spinner_item,
            subcategoryListWithNull.map { it.second }
        )

        removeButton.setOnClickListener {
            productListLayout.removeView(itemView)
        }

        unitSpinner.setSelection(0)
        subcategorySpinner.setSelection(0)

        productListLayout.addView(itemView)

        var unitId: Int? = null
        var subcategoryId: Int? = null

        unitSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                unitId = unitsListWithNull[position].first
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {
                unitId = null
            }
        }

        subcategorySpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                subcategoryId = subcategoryListWithNull[position].first
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {
                subcategoryId = null
            }
        }
    }



}
