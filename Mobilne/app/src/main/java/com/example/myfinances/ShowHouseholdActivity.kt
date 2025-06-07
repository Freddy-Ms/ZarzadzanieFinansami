package com.example.myfinances

import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class ShowHouseholdActivity : AppCompatActivity() {

    private val client = ApiClient.client
    private lateinit var listLayout: LinearLayout
    private lateinit var searchView: SearchView
    private val householdList = mutableListOf<Pair<Int, String>>()
    private val householdOwners = mutableMapOf<Int, Boolean>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_show_household)

        listLayout = findViewById(R.id.householdListLayout)
        searchView = findViewById(R.id.searchView)

        searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?) = false

            override fun onQueryTextChange(newText: String?): Boolean {
                displayFilteredHouseholds(newText ?: "")
                return true
            }
        })

        loadHouseholds()
    }
    private fun loadHouseholds() {
        val request = Request.Builder()
            .url("$BASE_URL/household/get")
            .get()
            .build()

        ApiClient.client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@ShowHouseholdActivity, "Connection error", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val responseData = response.body?.string()
                runOnUiThread {
                    if (response.isSuccessful && responseData != null) {
                        val households = JSONArray(responseData)
                        householdList.clear()
                        householdOwners.clear()

                        for (i in 0 until households.length()) {
                            val obj = households.getJSONObject(i)
                            val id = obj.getInt("id")
                            val name = obj.getString("name")
                            val isOwner = obj.optBoolean("is_owner", false)

                            householdList.add(id to name)
                            householdOwners[id] = isOwner
                        }

                        displayFilteredHouseholds("")
                    } else {
                        Toast.makeText(this@ShowHouseholdActivity, "No households found", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }

    private fun displayFilteredHouseholds(query: String) {
        listLayout.removeAllViews()

        val filtered = householdList.filter { it.second.contains(query, ignoreCase = true) }

        for ((id, name) in filtered) {
            val layout = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                setPadding(16, 16, 16, 16)
            }

            val nameText = TextView(this).apply {
                text = name
                textSize = 20f
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            }

            layout.addView(nameText)

            val isOwner = householdOwners[id] == true

            if (isOwner) {
                val editButton = Button(this).apply {
                    text = "Edit"
                    setOnClickListener {
                        val intent = Intent(this@ShowHouseholdActivity, EditHouseholdActivity::class.java)
                        intent.putExtra("household_id", id)
                        intent.putExtra("household_name", name)
                        startActivity(intent)
                    }
                }
                layout.addView(editButton)
            } else {
                val leaveButton = Button(this).apply {
                    text = "Leave"
                    setOnClickListener {
                        showConfirmDialog(id, name)
                    }
                }
                layout.addView(leaveButton)
            }

            listLayout.addView(layout)
        }
    }


    private fun showConfirmDialog(householdId: Int, name: String) {
        AlertDialog.Builder(this).apply {
            setTitle("Confirm")
            setMessage("Do you really want to leave '$name'?")
            setPositiveButton("Yes") { _, _ ->
                leaveHousehold(householdId)
            }
            setNegativeButton("No", null)
            create()
            show()
        }
    }

    private fun leaveHousehold(householdId: Int) {
        val json = JSONObject().apply {
            put("household_id", householdId)
        }

        val requestBody = RequestBody.create(
            "application/json".toMediaTypeOrNull(),
            json.toString()
        )

        val request = Request.Builder()
            .url("$BASE_URL/household/leave")
            .delete(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@ShowHouseholdActivity, "Leave failed", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ShowHouseholdActivity, "Left household", Toast.LENGTH_SHORT).show()
                        loadHouseholds()
                    } else {
                        Toast.makeText(this@ShowHouseholdActivity, "Error: ${response.code}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }
}

