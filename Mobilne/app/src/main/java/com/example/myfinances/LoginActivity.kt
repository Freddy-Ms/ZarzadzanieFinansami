package com.example.myfinances

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

var user = ""

class LoginActivity : AppCompatActivity() {

    private val client = ApiClient.client

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val passwordField = findViewById<EditText>(R.id.passwordField)
        val loginButton = findViewById<Button>(R.id.loginButton)
        val goToRegister = findViewById<TextView>(R.id.goToRegisterText)
        val sharedPreferences = getSharedPreferences("auth", MODE_PRIVATE)
        val editor = sharedPreferences.edit()

        goToRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        loginButton.setOnClickListener {
            val loginField = findViewById<EditText>(R.id.emailField)

            val password = passwordField.text.toString().trim()
            val login = loginField.text.toString().trim()
            if (login.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Fill all the fields above", Toast.LENGTH_SHORT).show()
            } else {
                loginUser(login, password)
            }
        }
    }

    private fun loginUser(loginInput: String, password: String) {
        val json = JSONObject().apply {
            if (loginInput.contains("@")) {
                put("email", loginInput)
            } else {
                put("username", loginInput)
            }
            user = loginInput
            put("password", password)
        }

        val requestBody = json.toString().toRequestBody("application/json".toMediaTypeOrNull())

        val request = Request.Builder()
            .url("$BASE_URL/user/login")
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@LoginActivity, "Network malfunction: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    if (response.isSuccessful) {
                        val headers = response.headers("Set-Cookie")
                        val accessToken = extractToken(headers, "access_token")
                        val refreshToken = extractToken(headers, "refresh_token")

                        val sharedPreferences = getSharedPreferences("auth", MODE_PRIVATE)
                        val editor = sharedPreferences.edit()
                        editor.putString("access_token", accessToken)
                        editor.putString("refresh_token", refreshToken)
                        editor.apply()
                        Toast.makeText(this@LoginActivity, "Login successful!", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@LoginActivity, MainActivity::class.java))
                        finish()
                    } else {
                        Toast.makeText(this@LoginActivity, "Login failed", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }

    private fun extractToken(headers: List<String>, name: String): String? {
        for (header in headers) {
            if (header.startsWith("$name=")) {
                return header.split(";")[0].split("=")[1]
            }
        }
        return null
    }
}