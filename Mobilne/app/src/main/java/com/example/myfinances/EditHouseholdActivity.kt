package com.example.myfinances

import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class EditHouseholdActivity : AppCompatActivity() {

    private val client = ApiClient.client
    private var householdId = -1
    private lateinit var householdName: String
    private lateinit var nameEditText: EditText
    private lateinit var saveButton: Button
    private lateinit var tokenTextView: TextView
    private lateinit var emailOrLoginEditText: EditText
    private lateinit var inviteButton: Button
    private lateinit var userListLayout: LinearLayout
    private lateinit var searchView: SearchView


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_edit_household)

        householdId = intent.getIntExtra("household_id", -1)
        householdName = intent.getStringExtra("household_name") ?: ""

        nameEditText = findViewById(R.id.editHouseholdName)
        saveButton = findViewById(R.id.saveButton)
        tokenTextView = findViewById(R.id.tokenTextView)
        emailOrLoginEditText = findViewById(R.id.emailOrLogin)
        inviteButton = findViewById(R.id.inviteButton)
        userListLayout = findViewById(R.id.userListLayout)
        searchView = findViewById(R.id.searchUsers)

        nameEditText.setText(householdName)

        saveButton.setOnClickListener {
            updateHouseholdName()
        }

        inviteButton.setOnClickListener {
            createInviteToken()
        }
        val copyButton = findViewById<Button>(R.id.copyTokenButton)
        copyButton.setOnClickListener {
            val clipboard = getSystemService(CLIPBOARD_SERVICE) as android.content.ClipboardManager
            val clip = android.content.ClipData.newPlainText("Token", tokenTextView.text.toString())
            clipboard.setPrimaryClip(clip)
            Toast.makeText(this, "Token copied", Toast.LENGTH_SHORT).show()
        }

    }

    private fun updateHouseholdName() {
        val newName = nameEditText.text.toString().trim()
        if (newName.isEmpty()) {
            Toast.makeText(this, "Enter a new name", Toast.LENGTH_SHORT).show()
            return
        }

        val json = JSONObject().apply {
            put("household_id", householdId)
            put("name", newName)
        }

        val body = json.toString().toRequestBody("application/json".toMediaTypeOrNull())

        val request = Request.Builder()
            .url("$BASE_URL/household/edit")
            .post(body)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(
                        this@EditHouseholdActivity,
                        "Error updating name",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    if (response.isSuccessful) {
                        Toast.makeText(
                            this@EditHouseholdActivity,
                            "Name updated",
                            Toast.LENGTH_SHORT
                        ).show()
                    } else {
                        Toast.makeText(
                            this@EditHouseholdActivity,
                            "Failed to update name",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
        })
    }

    private fun createInviteToken() {
        val input = emailOrLoginEditText.text.toString().trim()
        if (input.isEmpty()) {
            Toast.makeText(this, "Enter email", Toast.LENGTH_SHORT).show()
            return
        }

        val json = JSONObject().apply {
            put("household_id", householdId)
            put("email", input)
        }

        val body = json.toString().toRequestBody("application/json".toMediaTypeOrNull())

        val request = Request.Builder()
            .url("$BASE_URL/household/create_invite_token")
            .post(body)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(
                        this@EditHouseholdActivity,
                        "Failed to create token",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val body = response.body?.string()
                runOnUiThread {
                    if (response.isSuccessful && body != null) {
                        val json = JSONObject(body)
                        tokenTextView.text = "Token: ${json.getString("token")}"
                    } else {
                        Toast.makeText(
                            this@EditHouseholdActivity,
                            "Error: ${response.code}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
        })
    }

    // TODO: Add possibility to show all users in household and kick them

}
