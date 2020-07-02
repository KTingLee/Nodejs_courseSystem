# 學生選課系統
(目前已關閉AWS主機，因此連結失效)

作品 demo 連結： ~~http://18.191.233.126:3000~~，登入帳號：12345678，登入密碼：123

## 技術(使用到的模組)：
1. Node.js
2. Express 框架：建立路由(RESTful 風格)
3. express-session：登入成功後，要紀錄 session
4. cookie-parser：登入成功後，傳遞 cookie
5. ejs 模板：網頁模板
6. formidable：處理 post 表單
7. mongoDB (mongoose)：記錄學生資訊

除了上述的模組外，還會應用 jQuery 函式庫、Ajax 發送請求、Bootstrap 樣板。

## 作品簡介
<div class="col-sm-4" data-enable-grammarly="false">
    <h3><b>登入頁面</b></h3>
    <p>分成學生與管理員登入。</p><p><span style="color: rgb(255, 14, 14);">利用 Ajax 獲得登入成功與否之結果</span>，並直接在頁面中顯示，而不用進行網頁跳轉，藉此加強使用者體驗。</p>
</div>
<div class="col-sm-8" data-enable-grammarly="false"><img data-no-retina="true" src="https://images.cakeresume.com/DJy3y/ting19950215/d8f378c0-3321-492c-ba15-33dcb5f995a0.png" alt="Profile 05 00@2x" style="border-radius: 0px;" loading="" data-uploader-id="1" data-state="empty"></div>

<br>

<div class="col-sm-4" data-enable-grammarly="false">
    <h3><b>管理員介面 - 導入資料</b></h3>
    <p><b>後端</b>獲得上傳之資料後，<b>進一步驗證資料格式正確性</b>，若正確則將資料以 JSON格式<span style="color: rgb(255, 14, 14);">寫入至 MongoDB 中</span>。</p>
</div>
<div class="col-sm-8" data-enable-grammarly="false"><img data-no-retina="true" src="https://images.cakeresume.com/DJy3y/ting19950215/61aa45ec-4656-4512-a46b-1a43b2981ec0.png" alt="Profile 06 00@2x" loading="" style="border-radius: 0px;" data-uploader-id="2" data-state="empty"></div>

<br>

<div class="col-sm-4" data-enable-grammarly="false">
    <h3><b>管理員介面 - 新增、查看資料</b></h3>
    <p>除了以檔案上傳資料外，也可個別新增資料。同時<span style="color: rgb(255, 14, 14);">利用 jqGrid 以便直接修改資料</span>。</p>
    <p>同時，新增資料也會<span style="color: rgb(255, 14, 14);">利用 Ajax 獲取後端檢驗結果(資料是否重複)</span>，並直接在頁面中顯示。</p>
</div>
<div class="col-sm-8" style="margin-bottom: -20px;" data-enable-grammarly="false"><img data-no-retina="true" src="https://images.cakeresume.com/DJy3y/ting19950215/35cdb805-183d-441a-b32a-2b0fa6658344.png" alt="Profile 05 00@2x" style="border-radius: 0px;" loading="" data-uploader-id="3" data-state="empty"></div>

<br>

<div class="col-sm-4" data-enable-grammarly="false">
    <h3><b>學生登入後介面 - 修改資料</b></h3>
    <p><span style="color: rgb(255, 14, 14);">利用 seesion 機制</span>，檢查學生資料是否為初始資料，若為初始資料，則強至跳轉至修改頁面進行資料修改。</p>
</div>
<div class="col-sm-8" style="margin-bottom: -60px; margin-top: -20px;" data-enable-grammarly="false"><img data-no-retina="true" src="https://images.cakeresume.com/DJy3y/ting19950215/d4eef69d-a48e-43fc-a885-c77bb15865b5.png" alt="Profile 06 00@2x" loading="" style="border-radius: 0px;" data-uploader-id="4" data-state="empty"></div>

<br>

<div class="col-sm-5" data-enable-grammarly="false">
    <h3><b>學生登入後介面 - 課程資訊與選擇</b></h3>
    <p>利用 session 機制，依照不同學生，讓後端回傳相對應的課程狀況，以告知學生能否選擇課程。</p>
    <p>課程剩餘人數會即時依照選課人數而改變。</p>
</div>
<div class="col-sm-7" style="margin-bottom: -10px; margin-top: -20px;" data-enable-grammarly="false"><img data-no-retina="true" src="https://images.cakeresume.com/DJy3y/ting19950215/441c0b5d-f1eb-4ef2-9a97-746529e4cc21.png" alt="Profile 05 00@2x" style="border-radius: 0px;" loading="" data-uploader-id="5" data-state="empty"></div>

<br>

<div class="col-sm-4" data-enable-grammarly="false">
    <h3><b>學生登入後介面 - 查看所選課程</b></h3>
    <p style="color: rgb(0, 0, 0);">學生可從系統中查看所選課程，及其資訊，並提供退選按鈕，方便學生做退選動作。</p>
</div>
<div class="col-sm-8" style="margin-bottom: -45px; margin-top: -20px;" data-enable-grammarly="false"><img data-no-retina="true" src="https://images.cakeresume.com/DJy3y/ting19950215/767a5349-1ef5-45e9-8d2a-969fa0a7318c.png" alt="Profile 06 00@2x" loading="" style="border-radius: 0px;" data-uploader-id="6" data-state="empty"></div>
