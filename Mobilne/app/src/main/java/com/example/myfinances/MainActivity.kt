package com.example.myfinances

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.TextView
import android.widget.Toast
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import com.example.myfinances.ApiClient.client
import okhttp3.Request
import org.json.JSONArray
import java.io.IOException


class MainActivity : AppCompatActivity() {
    private var isOwner = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val toolbar = findViewById<Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        val welcomeText = findViewById<TextView>(R.id.welcomeText)
        welcomeText.text = "Welcome ${user}!"

        checkOwnershipStatus()
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.main_menu, menu)

        if (isOwner) {
            menu?.findItem(R.id.createHousehold)?.isVisible = false
        }

        return true
    }

    fun logout(item: MenuItem) {
        val requestBody = "".toRequestBody("application/json".toMediaTypeOrNull())
        val request = Request.Builder()
            .url("$BASE_URL/user/logout")
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(
                        this@MainActivity,
                        "Logout failed: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    if (response.isSuccessful) {
                        Toast.makeText(this@MainActivity, "Logged out", Toast.LENGTH_SHORT).show()
                        val intent = Intent(this@MainActivity, LoginActivity::class.java)
                        startActivity(intent)
                    } else {
                        Toast.makeText(this@MainActivity, "Logout failed", Toast.LENGTH_SHORT)
                            .show()
                    }
                }
            }
        })
    }

    private fun checkOwnershipStatus() {
        val request = Request.Builder()
            .url("$BASE_URL/household/get")
            .get()
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {}

            override fun onResponse(call: Call, response: Response) {
                val responseBody = response.body?.string() ?: return

                runOnUiThread {
                    try {
                        val households = JSONArray(responseBody)
                        isOwner = (0 until households.length())
                            .map { households.getJSONObject(it) }
                            .any { it.optBoolean("is_owner", false) }

                    } catch (e: Exception) {
                        isOwner = false
                    }

                    invalidateOptionsMenu()
                }
            }
        })
    }

    fun showHouseholds(item: android.view.MenuItem) {
        val intent = Intent(this, ShowHouseholdActivity::class.java)
        startActivity(intent)
    }

    fun createHousehold(item: MenuItem) {
        val intent = Intent(this, CreateHouseholdActivity::class.java)
        startActivity(intent)
    }

    fun joinHousehold(item: MenuItem) {
        val intent = Intent(this, JoinHouseholdActivity::class.java)
        startActivity(intent)
    }

    fun addReceipt(item: MenuItem) {
        val intent = Intent(this, AddReceiptActivity::class.java)
        startActivity(intent)
    }

    fun createShoppingList(item: MenuItem){
        val intent = Intent(this, CreateShoppingListActivity::class.java)
        startActivity(intent)
    }

    fun showShoppingLists(item: MenuItem){
        val intent = Intent(this, ShowShoppingListsActivity::class.java)
        startActivity(intent)
    }

    fun showPurchases(item: MenuItem){
        Toast.makeText(this, "not implemented yet", Toast.LENGTH_SHORT)
    }
}


