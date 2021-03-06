package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	// "strconv"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, World") // Hello, Worldってアクセスした人に返すよ！
}

func getPdf(w http.ResponseWriter, r *http.Request) {
	// クエリパラメータ取得してみる
	url := r.URL.Query().Get("url")
	// url := r.FormValue("url")
	fmt.Println(url)
	resp, err := http.Get(url) // GETリクエストでアクセスするよ！
	if err != nil {            // err ってのはエラーの時にエラーの内容が入ってくるよ！
		panic(err) // panicは処理を中断してエラーの中身を出力するよ！
	}
	defer resp.Body.Close() // 関数が終了するとなんかクローズするよ！（おまじない的な）

	if resp.StatusCode != http.StatusOK {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// w.Header().Set("Content-Disposition", "attachment; filename=dashboard.pdf")
	w.Header().Set("Content-Disposition", resp.Header.Get("Content-Disposition"))
	w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	w.Header().Set("Content-Length", resp.Header.Get("Content-Length"))
	w.Header().Set("Access-Control-Allow-Origin", "*")
	// log.Println(resp.Header.Get("Content-Disposition"))

	_, err = io.Copy(w, resp.Body)
	if err != nil {
		fmt.Println(err)
	}
	// return
}

func main() {
	// port, _ := strconv.Atoi(os.Args[1])
	//ディレクトリを指定する
	fs := http.FileServer(http.Dir("public"))
	//ルーティング設定。"/"というアクセスがきたらstaticディレクトリのコンテンツを表示させる
	http.Handle("/", fs)
	http.HandleFunc("/hello", handler)
	http.HandleFunc("/pdf", getPdf)

	log.Println("Listening...")
	// http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	fmt.Println(os.Getenv("PORT"))
	// http.ListenAndServe(":" + os.Getenv("PORT"), nil)

	var port string
	if os.Getenv("PORT") != "" {
		port = os.Getenv("PORT")
	} else {
		port = "5500"
	}
	http.ListenAndServe(":"+port, nil)

	// http.ListenAndServe(":5500", nil)
}
