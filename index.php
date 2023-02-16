<?php
require_once('path/to/node_modules/@adiwajshing/baileys/index.js');
$host = "localhost";
$user = "u1604793_Costomer";
$password = "Skynet#2822";
$database = "u1604793_Costomer";

$conn = mysqli_connect($host, $user, $password, $database);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
$client = new WAWebJS.Client();

// Membuat handler untuk menerima pesan WhatsApp
$client->onMessage(function ($message) {
    $nama = $message->sender->name;
    $alamat = $message->sender->city;
    $no_hp = $message->sender->formattedName;
    $aktivasi = $message->message->activation;
    $paket = $message->message->package;

    // Menyimpan data ke dalam tabel costomer
    global $conn;
    $sql = "INSERT INTO costomer (nama, alamat, no_hp, aktivasi, paket) VALUES ('$nama', '$alamat', '$no_hp', '$aktivasi', '$paket')";
    if (mysqli_query($conn, $sql)) {
        echo "Data berhasil disimpan";
    } else {
        echo "Error: " . $sql . "<br>" . mysqli_error($conn);
    }
});

// Menghubungkan ke server WhatsApp
$client->connect();


?>