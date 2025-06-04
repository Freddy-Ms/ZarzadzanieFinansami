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

const val BASE_URL = "http:192.168.100.6:5000"

var user = ""

class LoginActivity : AppCompatActivity() {

    // CookieJar to przechowywania cookies w pamięci
    class SimpleCookieJar : CookieJar {
        private val cookieStore: MutableMap<String, List<Cookie>> = HashMap()

        override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
            cookieStore[url.host] = cookies
        }

        override fun loadForRequest(url: HttpUrl): List<Cookie> {
            return cookieStore[url.host] ?: emptyList()
        }
    }

    private val cookieJar = SimpleCookieJar()

    private val client = OkHttpClient.Builder()
        .cookieJar(cookieJar)
        .build()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val passwordField = findViewById<EditText>(R.id.passwordField)
        val loginButton = findViewById<Button>(R.id.loginButton)
        val goToRegister = findViewById<TextView>(R.id.goToRegisterText)

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
}