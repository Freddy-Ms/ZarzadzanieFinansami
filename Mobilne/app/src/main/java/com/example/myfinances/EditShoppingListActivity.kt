package com.example.myfinances

import android.annotation.SuppressLint
import androidx.appcompat.app.AppCompatActivity

import android.os.Bundle
import android.widget.*
import okhttp3.*
import com.example.myfinances.ApiClient.client
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class EditShoppingListActivity : AppCompatActivity() {
    private lateinit var listNameTextView: TextView
    private lateinit var productsContainer: LinearLayout

    private val unitList = mutableMapOf<Int, String>()
    private val subcategoryList = mutableMapOf<Int, String>()

    private var listId: Int = -1

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

        loadReferenceData()
    }

    private fun loadReferenceData() {
        val unitReq = Request.Builder().url("$BASE_URL/quantityunit/get").get().build()
        val subcatReq = Request.Builder().url("$BASE_URL/subcategory/get").get().build()

        client.newCall(unitReq).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread { Toast.makeText(this@EditShoppingListActivity, "Failed to load units", Toast.LENGTH_SHORT).show() }
            }
            override fun onResponse(call: Call, response: Response) {
                val body = response.body?.string() ?: return
                val arr = JSONArray(body)
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    unitList[obj.getInt("id")] = obj.getString("name")
                }
                loadListDetails()
            }
        })

        client.newCall(subcatReq).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {}
            override fun onResponse(call: Call, response: Response) {
                val body = response.body?.string() ?: return
                val arr = JSONArray(body)
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    subcategoryList[obj.getInt("id")] = obj.getString("name")
                }
            }
        })
    }

    private fun loadListDetails() {
        val req = Request.Builder()
            .url("$BASE_URL/shoppinglist/get")
            .get()
            .build()

        client.newCall(req).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@EditShoppingListActivity, "Load failed", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val arr = JSONArray(response.body?.string() ?: "[]")
                var found: JSONObject? = null
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    if (obj.getInt("id") == listId) {
                        found = obj
                        break
                    }
                }

                if (found == null) {
                    runOnUiThread {
                        Toast.makeText(this@EditShoppingListActivity, "List not found", Toast.LENGTH_SHORT).show()
                        finish()
                    }
                    return
                }

                val listName = found.optString("name", "")
                val prodArr = found.optJSONArray("products") ?: JSONArray()

                runOnUiThread {
                    listNameTextView.text = listName
                    productsContainer.removeAllViews()
                    for (i in 0 until prodArr.length()) {
                        val p = prodArr.getJSONObject(i)
                        renderProductReadonly(p)
                    }
                }
            }
        })
    }

    private fun renderProductReadonly(product: JSONObject) {
        val itemView = layoutInflater.inflate(R.layout.item_shopping_product_readonly, productsContainer, false)

        val name = product.optString("name", "")
        val qty = product.optDouble("quantity", 0.0)
        val unitId = product.optInt("unit_id", -1)
        val subId = product.optInt("subcategory_id", -1)

        itemView.findViewById<TextView>(R.id.productNameText).text = "• $name"
        itemView.findViewById<TextView>(R.id.productDetailsText).text =
            "Qty: $qty  | Unit: ${unitList[unitId] ?: "-"}  | Category: ${subcategoryList[subId] ?: "-"}"
        // TODO: Add unit and category name from database
        productsContainer.addView(itemView)
    }
}
