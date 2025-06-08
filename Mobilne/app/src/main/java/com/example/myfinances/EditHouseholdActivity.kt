package com.example.myfinances

import android.os.Bundle
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
    private val allMembers = mutableListOf<String>()


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

        searchView.setIconifiedByDefault(false)
        searchView.isFocusable = true
        searchView.isFocusableInTouchMode = true
        searchView.requestFocus()

        nameEditText.setText(householdName)
        loadMembers()

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
        searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?) = false

            override fun onQueryTextChange(newText: String?): Boolean {
                showFilteredMembers(newText?: "")
                return true
            }
        })
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

    private fun loadMembers() {
        val request = Request.Builder()
            .url("$BASE_URL/household/get")
            .get()
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@EditHouseholdActivity, "Failed to load members", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val responseText = response.body?.string()
                if (response.isSuccessful && responseText != null) {
                    val households = JSONArray(responseText)
                    for (i in 0 until households.length()) {
                        val obj = households.getJSONObject(i)
                        if (obj.getInt("id") == householdId) {
                            val members = obj.getJSONArray("members")
                            runOnUiThread {
                                displayMembers(members)
                            }
                            break
                        }
                    }
                } else {
                    runOnUiThread {
                        Toast.makeText(this@EditHouseholdActivity, "Could not fetch members", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }
    private fun displayMembers(members: JSONArray) {
        allMembers.clear()
        for (i in 0 until members.length()) {
            val username = members.getString(i)
            allMembers.add(username)
        }
        showFilteredMembers("")
    }

    private fun showConfirmDialog(householdId: Int, username: String) {
        AlertDialog.Builder(this).apply {
            setTitle("Confirm")
            setMessage("Do you really want to kick '$username'?")
            setPositiveButton("Yes") { _, _ ->
                kickUser(householdId, username)
            }
            setNegativeButton("No", null)
            create()
            show()
        }
    }

    private fun kickUser(householdId: Int, username: String) {
        val json = JSONObject().apply {
            put("household_id", householdId)
            put("username_to_kick", username)
        }

        val requestBody = json.toString().toRequestBody("application/json".toMediaTypeOrNull())

        val request = Request.Builder()
            .url("$BASE_URL/household/kick")
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@EditHouseholdActivity, "Kick failed", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    if (response.isSuccessful) {
                        Toast.makeText(this@EditHouseholdActivity, "User kicked", Toast.LENGTH_SHORT).show()
                        loadMembers() // reload after kick
                    } else {
                        Toast.makeText(this@EditHouseholdActivity, "Error: ${response.code}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }

    private fun showFilteredMembers(query: String) {
        userListLayout.removeAllViews()
        val filtered = allMembers.filter { it.contains(query, ignoreCase = true) }

        for (username in filtered) {
            val row = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                setPadding(8, 8, 8, 8)
            }

            val nameText = TextView(this).apply {
                text = username
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                textSize = 18f
            }

            val kickButton = Button(this).apply {
                text = "Kick"
                setOnClickListener {
                    showConfirmDialog(householdId, username)
                }
            }

            row.addView(nameText)
            row.addView(kickButton)
            userListLayout.addView(row)
        }
    }

}
