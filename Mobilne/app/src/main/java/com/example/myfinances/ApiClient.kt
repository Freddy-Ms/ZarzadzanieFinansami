package com.example.myfinances

import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.OkHttpClient

const val BASE_URL = "http://192.168.100.6:5000" //Change for your address of local app

object ApiClient {

    class PersistentCookieJar(val context: android.content.Context) : CookieJar {
        private val cookieStore = mutableMapOf<String, List<Cookie>>()

        override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
            cookieStore[url.host] = cookies

            val prefs = context.getSharedPreferences("auth", android.content.Context.MODE_PRIVATE)
            val editor = prefs.edit()
            for (cookie in cookies) {
                editor.putString(cookie.name, cookie.value)
            }
            editor.apply()
        }

        override fun loadForRequest(url: HttpUrl): List<Cookie> {
            val prefs = context.getSharedPreferences("auth", android.content.Context.MODE_PRIVATE)
            val cookies = mutableListOf<Cookie>()
            val host = url.host

            val access = prefs.getString("access_token", null)
            val refresh = prefs.getString("refresh_token", null)

            if (access != null) {
                cookies.add(
                    Cookie.Builder()
                        .domain(host)
                        .path("/")
                        .name("access_token")
                        .value(access)
                        .httpOnly()
                        .build()
                )
            }

            if (refresh != null) {
                cookies.add(
                    Cookie.Builder()
                        .domain(host)
                        .path("/")
                        .name("refresh_token")
                        .value(refresh)
                        .httpOnly()
                        .build()
                )
            }

            return cookies
        }
    }

    lateinit var client: OkHttpClient

    fun init(context: android.content.Context) {
        client = OkHttpClient.Builder()
            .cookieJar(PersistentCookieJar(context))
            .connectTimeout(60, java.util.concurrent.TimeUnit.SECONDS) // czas na nawiązanie połączenia
            .readTimeout(60, java.util.concurrent.TimeUnit.SECONDS)    // czas na odczyt odpowiedzi
            .writeTimeout(60, java.util.concurrent.TimeUnit.SECONDS)   // czas na wysłanie zapytania
            .build()
    }

}
