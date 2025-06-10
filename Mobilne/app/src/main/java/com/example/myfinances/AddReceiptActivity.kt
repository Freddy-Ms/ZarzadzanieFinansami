package com.example.myfinances

import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.asRequestBody
import org.json.JSONObject
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.*

class AddReceiptActivity : AppCompatActivity() {

    private lateinit var captureButton: Button
    private lateinit var uploadButton: Button
    private lateinit var preview: ImageView
    private var photoUri: Uri? = null
    private var photoFile: File? = null
    private val client = ApiClient.client
    private val CAMERA_PERMISSION_REQUEST_CODE = 100
    private val CAMERA_REQUEST_CODE = 101

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_add_receipt)

        captureButton = findViewById(R.id.captureReceiptButton)
        uploadButton = findViewById(R.id.uploadReceiptButton)
        preview = findViewById(R.id.receiptPreview)

        uploadButton.visibility = View.GONE

        captureButton.setOnClickListener {
            checkCameraPermission()
        }

        uploadButton.setOnClickListener {
            photoFile?.let {
                sendToOCR(it)
            } ?: Toast.makeText(this, "No photo selected", Toast.LENGTH_SHORT).show()
        }
    }

    private fun checkCameraPermission() {
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(android.Manifest.permission.CAMERA),
                CAMERA_PERMISSION_REQUEST_CODE
            )
        } else {
            capturePhoto()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == CAMERA_PERMISSION_REQUEST_CODE && grantResults.isNotEmpty()
            && grantResults[0] == PackageManager.PERMISSION_GRANTED
        ) {
            capturePhoto()
        } else {
            Toast.makeText(this, "Camera permission is required", Toast.LENGTH_SHORT).show()
        }
    }

    private fun capturePhoto() {
        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        photoFile = createImageFile()

        photoFile?.let {
            photoUri = FileProvider.getUriForFile(
                this,
                "${packageName}.provider",
                it
            )
            intent.putExtra(MediaStore.EXTRA_OUTPUT, photoUri)
            intent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
            startActivityForResult(intent, CAMERA_REQUEST_CODE)
        }
    }

    private fun createImageFile(): File {
        val storageDir = File(getExternalFilesDir("Receipts"), "")
        if (!storageDir.exists()) storageDir.mkdirs()

        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        return File(storageDir, "receipt_$timeStamp.jpg")
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == CAMERA_REQUEST_CODE && resultCode == RESULT_OK) {
            preview.setImageURI(photoUri)
            uploadButton.visibility = View.VISIBLE
        }
    }

    private fun sendToOCR(file: File) {
        val requestBody = MultipartBody.Builder().setType(MultipartBody.FORM)
            .addFormDataPart(
                "receipt",
                file.name,
                file.asRequestBody("image/jpeg".toMediaTypeOrNull())
            )
            .build()

        val request = Request.Builder()
            .url("$BASE_URL/OCR")
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(
                        this@AddReceiptActivity,
                        "Failed: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val body = response.body?.string()
                runOnUiThread {
                    if (response.isSuccessful && body != null) {
                        val json = JSONObject(body)
                        val products = json.getJSONArray("products")

                        val intent = Intent(this@AddReceiptActivity, CreatePurchaseActivity::class.java)
                        intent.putExtra("ocrProducts", products.toString())
                        intent.putExtra("photoPath", file.absolutePath)
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(
                            this@AddReceiptActivity,
                            "Error: ${response.code}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
        })
    }
}
