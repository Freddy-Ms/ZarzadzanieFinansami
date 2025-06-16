package com.example.myfinances

import android.app.AlertDialog
import android.content.Intent
import android.graphics.BitmapFactory
import android.os.Bundle
import android.util.Log
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.myfinances.ApiClient.client
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.util.Base64

class ShowPurchaseActivity : AppCompatActivity() {

    private lateinit var purchaseLayout: LinearLayout
    private lateinit var searchView: SearchView

    private val purchases = mutableListOf<JSONObject>()
    private val householdMap = mutableMapOf<Int, String>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_show_purchases)

        purchaseLayout = findViewById(R.id.purchaseLayout)
        searchView = findViewById(R.id.searchView)

        searchView.setIconifiedByDefault(false)
        searchView.isFocusable = true
        searchView.isFocusableInTouchMode = true
        searchView.requestFocus()

        searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?) = false
            override fun onQueryTextChange(newText: String?): Boolean {
                displayFilteredPurchases(newText ?: "")
                return true
            }
        })

        loadHouseholdsAndPurchases()
    }

    private fun loadHouseholdsAndPurchases() {
        val householdRequest = Request.Builder()
            .url("$BASE_URL/household/get")
            .get()
            .build()

        client.newCall(householdRequest).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@ShowPurchaseActivity, "Failed to load households", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val households = JSONArray(response.body?.string() ?: return)
                for (i in 0 until households.length()) {
                    val obj = households.getJSONObject(i)
                    householdMap[obj.getInt("id")] = obj.getString("name")
                }
                loadPurchases()
            }
        })
    }

    private fun loadPurchases() {
        val request = Request.Builder()
            .url("$BASE_URL/purchaseevent/get")
            .post("{}".toRequestBody("application/json".toMediaTypeOrNull()))
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@ShowPurchaseActivity, "Failed to load purchases", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val body = response.body?.string() ?: return
                val json = JSONObject(body)
                val events = json.optJSONArray("events") ?: JSONArray()

                purchases.clear()
                for (i in 0 until events.length()) {
                    purchases.add(events.getJSONObject(i))
                }
                runOnUiThread { displayFilteredPurchases("") }
            }
        })
    }

    private fun displayFilteredPurchases(query: String) {
        purchaseLayout.removeAllViews()

        val filtered = purchases.filter { purchase ->
            val name = purchase.optString("name", "")
            val householdId = purchase.optInt("household_id", -1)
            val householdName = householdMap[householdId] ?: ""
            name.contains(query, ignoreCase = true) || householdName.contains(query, ignoreCase = true)
        }

        for (purchase in filtered) {
            val layout = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                setPadding(16, 16, 16, 16)
            }

            val nameView = TextView(this).apply {
                text = purchase.optString("name", "Unnamed")
                textSize = 18f
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            }

            val editBtn = Button(this).apply {
                text = "Edit"
                setOnClickListener {
                    val intent = Intent(this@ShowPurchaseActivity, EditPurchaseActivity::class.java)
                    intent.putExtra("purchase_id", purchase.getInt("id"))
                    startActivity(intent)
                }
            }

            val deleteBtn = Button(this).apply {
                text = "Delete"
                setOnClickListener {
                    showDeleteDialog(purchase.getInt("id"), purchase.optString("name"))
                }
            }

            val receiptBtn = Button(this).apply {
                text = "Receipt"
                setOnClickListener {
                    showReceipt(purchase.getInt("id"))
                }
            }

            layout.addView(nameView)
            layout.addView(editBtn)
            layout.addView(deleteBtn)
            layout.addView(receiptBtn)

            purchaseLayout.addView(layout)
        }
    }

    private fun showDeleteDialog(purchaseId: Int, name: String) {
        AlertDialog.Builder(this).apply {
            setTitle("Delete")
            setMessage("Are you sure you want to delete \"$name\"?")
            setPositiveButton("Yes") { _, _ -> deletePurchase(purchaseId) }
            setNegativeButton("No", null)
            create()
            show()
        }
    }

    private fun deletePurchase(purchaseId: Int) {
        val json = JSONObject().put("event_id", purchaseId)
        val req = Request.Builder()
            .url("$BASE_URL/purchaseevent/delete")
            .post(json.toString().toRequestBody("application/json".toMediaTypeOrNull()))
            .build()

        client.newCall(req).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@ShowPurchaseActivity, "Delete failed", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ShowPurchaseActivity, "Purchase deleted", Toast.LENGTH_SHORT).show()
                        loadPurchases()
                    } else {
                        Toast.makeText(this@ShowPurchaseActivity, "Error: ${response.code}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }

    private fun showReceipt(purchaseId: Int) {
        val json = JSONObject().put("event_id", purchaseId)
        val req = Request.Builder()
            .url("$BASE_URL/purchaseevent/receipt/get")
            .post(json.toString().toRequestBody("application/json".toMediaTypeOrNull()))
            .build()

        client.newCall(req).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@ShowPurchaseActivity, "Failed to load receipt", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val inputStream = response.body?.byteStream()
                if (response.isSuccessful && inputStream != null) {
                    val bitmap = BitmapFactory.decodeStream(inputStream)
                    runOnUiThread {
                        val dialog = AlertDialog.Builder(this@ShowPurchaseActivity).create()
                        val imageView = ImageView(this@ShowPurchaseActivity)
                        imageView.setImageBitmap(bitmap)

                        dialog.setView(imageView)
                        dialog.setButton(AlertDialog.BUTTON_POSITIVE, "Close") { d, _ -> d.dismiss() }
                        dialog.show()
                    }
                } else {
                    runOnUiThread {
                        Toast.makeText(this@ShowPurchaseActivity, "Receipt not available", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }
}
