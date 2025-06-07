package com.example.myfinances

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class CreateHouseholdActivity : AppCompatActivity() {

    private val client = ApiClient.client
    private lateinit var householdNameEditText: EditText
    private lateinit var createButton: Button
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_household)

        householdNameEditText = findViewById(R.id.householdNameEditText)
        createButton = findViewById(R.id.createHouseholdButton)
        progressBar = findViewById(R.id.progressBar)

        createButton.setOnClickListener {
            val name = householdNameEditText.text.toString().trim()
            if (name.isEmpty()) {
                Toast.makeText(this, "Please enter a name", Toast.LENGTH_SHORT).show()
            } else {
                createHousehold(name)
            }
        }
    }

    private fun createHousehold(name: String) {
        progressBar.visibility = View.VISIBLE

        val json = JSONObject().apply {
            put("name", name)
        }

        val requestBody = json.toString().toRequestBody("application/json".toMediaTypeOrNull())

        val request = Request.Builder()
            .url("$BASE_URL/household/create")
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    progressBar.visibility = View.GONE
                    Toast.makeText(
                        this@CreateHouseholdActivity,
                        "Network error",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    progressBar.visibility = View.GONE
                    if (response.isSuccessful) {
                        Toast.makeText(
                            this@CreateHouseholdActivity,
                            "Household created!",
                            Toast.LENGTH_SHORT
                        ).show()

                        val intent =
                            Intent(this@CreateHouseholdActivity, EditHouseholdActivity::class.java)
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(
                            this@CreateHouseholdActivity,
                            "Creation failed",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
        })
    }
}
