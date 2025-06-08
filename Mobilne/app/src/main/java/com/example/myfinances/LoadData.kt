package com.example.myfinances

import android.R
import android.widget.ArrayAdapter
import android.widget.Spinner
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

import okhttp3.Call
import okhttp3.Callback
import okhttp3.Request
import okhttp3.Response
import org.json.JSONArray
import java.io.IOException

class LoadData(
    private val context: AppCompatActivity,
    private val unitList: MutableList<Pair<Int, String>>? = null,
    private val subcategoryList: MutableList<Pair<Int, String>>? = null,
    private val householdList: MutableList<Pair<Int, String>>? = null,
    private val householdSpinner: Spinner? = null,
    private val onComplete: (() -> Unit)? = null
) {

    fun loadUnits() {
        val request = Request.Builder().url("$BASE_URL/quantityunit/get").get().build()
        ApiClient.client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                context.runOnUiThread {
                    Toast.makeText(context, "Failed to load units", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                response.body?.string()?.let { body ->
                    val jsonArray = JSONArray(body)
                    unitList?.clear()
                    for (i in 0 until jsonArray.length()) {
                        val obj = jsonArray.getJSONObject(i)
                        unitList?.add(obj.getInt("id") to obj.getString("name"))
                    }
                    context.runOnUiThread { onComplete?.invoke() }
                }
            }
        })
    }

    fun loadSubcategories() {
        val request = Request.Builder().url("$BASE_URL/subcategory/get").get().build()
        ApiClient.client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                context.runOnUiThread {
                    Toast.makeText(context, "Failed to load subcategories", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                response.body?.string()?.let { body ->
                    val jsonArray = JSONArray(body)
                    subcategoryList?.clear()
                    for (i in 0 until jsonArray.length()) {
                        val obj = jsonArray.getJSONObject(i)
                        subcategoryList?.add(obj.getInt("id") to obj.getString("name"))
                    }
                    context.runOnUiThread { onComplete?.invoke() }
                }
            }
        })
    }

    fun loadHouseholds() {
        val request = Request.Builder().url("$BASE_URL/household/get").get().build()
        ApiClient.client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                context.runOnUiThread {
                    Toast.makeText(context, "Failed to load households", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                response.body?.string()?.let { body ->
                    val jsonArray = JSONArray(body)
                    householdList?.clear()
                    householdList?.add(-1 to "None")
                    for (i in 0 until jsonArray.length()) {
                        val obj = jsonArray.getJSONObject(i)
                        householdList?.add(obj.getInt("id") to obj.getString("name"))
                    }

                    context.runOnUiThread {
                        householdSpinner?.adapter = ArrayAdapter(
                            context,
                            com.example.myfinances.R.layout.spinner_item,
                            householdList?.map { it.second } ?: listOf()
                        ).apply {
                            setDropDownViewResource(R.layout.simple_spinner_dropdown_item)
                        }
                        onComplete?.invoke()
                    }
                }
            }
        })
    }

}
