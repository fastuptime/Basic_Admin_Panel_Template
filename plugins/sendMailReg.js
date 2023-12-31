
/*

Örnek Kullanım:
sendMail.run(
{
    to: "fastuptime@gmail.com",
    subject: "Test",
    html: "<h1>Test</h1>"
}).then((data) => {
    console.log(data);
});

[Plugin] Yapımcı: Can, sendMail(1.0.0) yuklendi.
{
  status: true,
  message: 'Mail başarıyla gönderildi.',
  info: '<ed17780f-d673-69fa-4b80-a019627b5002@gmail.com>'
}

*/
module.exports =  {
    name: "sendMail",
    version: "1.0.0",
    author: "Can",
    run: async function (data) {
        smtp = db.get("smtp") || false;
        if(!smtp) return { status: false, message: "SMTP ayarları bulunamadı. Lütfen ayarları kontrol ediniz." }
        
        let transporter = nodemailer.createTransport({
            host: smtp.host,
            port: smtp.port,
            secure: smtp.secure,
            auth: {
                user: smtp.auth.user,
                pass: smtp.auth.pass,
            },
        });

        let info = await transporter.sendMail({
            from: smtp.auth.user,
            to: data.to, 
            subject: data.subject || "FastUptime Admin Panel Template Mail Sender",
            html: data.html 
        });

        if (!info.messageId) return { status: false, message: "Mail gönderilirken bir hata oluştu lütfen daha sonra tekrar deneyiniz." }
        return { status: true, message: "Mail başarıyla gönderildi.", info: info.messageId }

    }
};