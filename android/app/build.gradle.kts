plugins {
    id("com.android.application")
}

android {
    namespace = "app.lineadefuego.game"
    compileSdk = 35

    defaultConfig {
        applicationId = "app.lineadefuego.game"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    signingConfigs {
        create("release") {
            storeFile = file("../linea-release.keystore")
            storePassword = System.getenv("LINEA_STORE_PASSWORD") ?: ""
            keyAlias = "linea"
            keyPassword = System.getenv("LINEA_KEY_PASSWORD") ?: ""
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
