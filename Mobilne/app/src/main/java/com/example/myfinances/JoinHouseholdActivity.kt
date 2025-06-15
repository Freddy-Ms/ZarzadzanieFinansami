package com.example.myfinances

import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class JoinHouseholdActivity : AppCompatActivity() {

    private val client = ApiClient.client
    private lateinit var tokenInput: EditText
    private lateinit var joinButton: Button
    private lateinit var backButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_join_household)

        tokenInput = findViewById(R.id.tokenInput)
        joinButton = findViewById(R.id.joinButton)
        backButton = findViewById(R.id.backButton)

        joinButton.setOnClickListener {
            val token = tokenInput.text.toString().trim()
            if (token.isEmpty()) {
                Toast.makeText(this, "Please enter the token", Toast.LENGTH_SHORT).show()
            } else {
                sendTokenToBackend(token)
            }
        }

        backButton.setOnClickListener {
            finish()
        }
    }

    private fun sendTokenToBackend(token: String) {
        val json = JSONObject().apply {
            put("token", token)
        }

        val requestBody = json.toString().toRequestBody("application/json".toMediaTypeOrNull())

        val request = Request.Builder()
            .url("$BASE_URL/household/accept_invite")
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(
                        this@JoinHouseholdActivity,
                        "Connection error",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    val responseText = response.body?.string()
                    if (response.isSuccessful) {
                        Toast.makeText(
                            this@JoinHouseholdActivity,
                            "Joined successfully!",
                            Toast.LENGTH_SHORT
                        ).show()
                        startActivity(Intent(this@JoinHouseholdActivity, MainActivity::class.java))
                        finish()
                    } else {
                        val errorMsg = try {
                            JSONObject(responseText ?: "{}").optString("message", "Failed")
                        } catch (e: Exception) {
                            "An error occurred (${response.code})"
                        }
                        Toast.makeText(this@JoinHouseholdActivity, errorMsg, Toast.LENGTH_LONG)
                            .show()
                    }
                }
            }

        })
    }
}
