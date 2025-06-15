package com.example.myfinances

import android.app.Application

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        ApiClient.init(this)
    }
}