package com.example.myfinances

import android.app.AlertDialog
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class ShowShoppingListsActivity : AppCompatActivity() {

    private val client = ApiClient.client
    private lateinit var listLayout: LinearLayout
    private lateinit var searchView: SearchView

    private val shoppingLists = mutableListOf<JSONObject>()
    private val householdMap = mutableMapOf<Int, String>()  // id -> name

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_show_shopping_lists)

        listLayout = findViewById(R.id.shoppingListsLayout)
        searchView = findViewById(R.id.searchView)

        searchView.setIconifiedByDefault(false)
        searchView.isFocusable = true
        searchView.isFocusableInTouchMode = true
        searchView.requestFocus()

        searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?) = false

            override fun onQueryTextChange(newText: String?): Boolean {
                displayFilteredLists(newText ?: "")
                return true
            }
        })

        loadHouseholdsAndLists()
    }

    private fun loadHouseholdsAndLists() {
        val householdRequest = Request.Builder()
            .url("$BASE_URL/household/get")
            .get()
            .build()

        client.newCall(householdRequest).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@ShowShoppingListsActivity, "Failed to load households", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val responseData = response.body?.string() ?: return
                val households = JSONArray(responseData)

                householdMap.clear()
                for (i in 0 until households.length()) {
                    val obj = households.getJSONObject(i)
                    val id = obj.getInt("id")
                    val name = obj.getString("name")
                    householdMap[id] = name
                }

                loadShoppingLists()
            }
        })
    }

    private fun loadShoppingLists() {
        val request = Request.Builder()
            .url("$BASE_URL/shoppinglist/get")
            .get()
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@ShowShoppingListsActivity, "Failed to load shopping lists", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val responseData = response.body?.string() ?: return
                val lists = JSONArray(responseData)

                shoppingLists.clear()
                for (i in 0 until lists.length()) {
                    shoppingLists.add(lists.getJSONObject(i))
                }

                runOnUiThread {
                    displayFilteredLists("")
                }
            }
        })
    }

    private fun displayFilteredLists(query: String) {
        listLayout.removeAllViews()

        val filtered = shoppingLists.filter { list ->
            val name = list.optString("name", "")
            val householdId = list.optInt("household_id", -1)
            val householdName = householdMap[householdId] ?: ""

            name.contains(query, ignoreCase = true) || householdName.contains(query, ignoreCase = true)
        }

        for (list in filtered) {
            val layout = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                setPadding(16, 16, 16, 16)
            }

            val listName = list.getString("name")
            val textView = TextView(this).apply {
                text = listName
                textSize = 18f
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            }

            val editButton = Button(this).apply {
                text = "Edit"
                setOnClickListener {
                    Toast.makeText(this@ShowShoppingListsActivity, "Edit not implemented", Toast.LENGTH_SHORT).show()
                }
            }

            val deleteButton = Button(this).apply {
                text = "Delete"
                setOnClickListener {
                    showDeleteDialog(list.getInt("id"), listName)
                }
            }

            layout.addView(textView)
            layout.addView(editButton)
            layout.addView(deleteButton)

            listLayout.addView(layout)
        }
    }

    private fun showDeleteDialog(listId: Int, listName: String) {
        AlertDialog.Builder(this).apply {
            setTitle("Delete")
            setMessage("Are you sure you want to delete \"$listName\"?")
            setPositiveButton("Yes") { _, _ -> deleteList(listId) }
            setNegativeButton("No", null)
            create()
            show()
        }
    }

    private fun deleteList(listId: Int) {
        val json = JSONObject().apply {
            put("list_id", listId)
        }

        val body = json.toString().toRequestBody("application/json".toMediaTypeOrNull())

        val request = Request.Builder()
            .url("$BASE_URL/shoppinglist/delete")
            .post(body)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@ShowShoppingListsActivity, "Delete failed", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ShowShoppingListsActivity, "List deleted", Toast.LENGTH_SHORT).show()
                        loadShoppingLists()
                    } else {
                        Toast.makeText(this@ShowShoppingListsActivity, "Error: ${response.code}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }
}
