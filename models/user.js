const user = new Schema({
    id: { type: Number, default: () => getLength("user") }, // ID
    username: { type: String, required: true }, // Kullanıcı adı
    password: { type: String, required: true }, // Şifre (md5)
    balance: { type: Number, default: 0 }, // Bakiye
    spent: { type: Number, default: 0 }, // Harcanan
    role: { type: String, default: "user" }, // user, staff, admin
    person: {
        name: { type: String, default: "" }, // Adı
        surname: { type: String, default: "" }, // Soyadı
        country: { type: String, default: "" }, // Ülkesi
        city: { type: String, default: "" }, // Şehri
        address: { type: String, default: "" }, // Adresi
        zip: { type: String, default: "" }, // Posta kodu
        birth: { type: String, default: "" }, // Doğum tarihi
    },
    mail: {
        status: { type: Boolean, default: false }, // Doğrulandı mı?
        code: { type: String, default: () => md5(Date.now()) }, // Doğrulama kodu (md5)
        address: { type: String, default: "" } // Mail adresi
    },
    phone: {
        number: { type: String, default: '' }, // Telefon numarası
        verify: { type: Boolean, default: false }, // Doğrulandı mı?
        code: { type: String, default: () => { return Math.floor(100000 + Math.random() * 900000) } }, // Doğrulama kodu (6 haneli)
    },
    ref: {
        ref_code: { type: String, default: () => { return Math.floor(100000 + Math.random() * 90000000) } }, // Referans kodu (8 haneli)
        reffered: { type: Number, default: 0 }, // Kaç kişiye referans olduğu
        clicks: { type: Number, default: 0 }, // Kaç kişi referans linkine tıkladı
        earned: { type: Number, default: 0 }, // Toplam kazanç
        withdraw: { type: Number, default: 0 }, // Çekilen tutar
        reffered_users: { type: Array, default: [] }, // Kime referans olduğu
        reffered_by: { type: String, default: "" }, // Kimin referansı olduğu
    },
    ban: {
        status: { type: Boolean, default: false }, // Ban durumu
        reason: { type: String, default: '' }, // Ban sebebi
        admin: { type: String, default: '' }, // Banlayan admin
        date: { type: String, default: '' }, // Ban tarihi
    },
    api: {
        api_key: { type: String, default: () => { return md5(Date.now() + Math.floor(100000 + Math.random() * 90000000)) + Math.floor(1000 + Math.random() * 9000) } }, // API anahtarı
        status: { type: Boolean, default: false }, // API durumu
    },
    logs: { type: Array, default: [] }, // Kullanıcı logları { ip: "", date: "", action: "Login", status: "Success", details: "", userID: "" } gibi
    created: { type: String, default: () => dayjs().format("YYYY-MM-DD HH:mm:ss") },
});

user.statics.register = async function({ username, password, mail }) {
    if(!mail.includes("@") || !mail.includes(".")) return { status: false, message: "Geçersiz mail adresi."}
    if(password.length < 6) return { status: false, message: "Şifre en az 6 karakter olmalı."}
    if(username.length < 3) return { status: false, message: "Kullanıcı adı en az 3 karakter olmalı."}

    let user = await this.findOne({ username: username });
    if (user) return { status: false, message: "Bu kullanıcı adı zaten alınmış."}
    user = await this.findOne({ "mail.address": mail });
    if (user) return { status: false, message: "Bu mail adresi zaten alınmış."}
    user = new this({
        username: username,
        password: md5(password + config.salt),
        mail: {
            address: mail,
        }
    });

    try {
        data = await sendMail.run(
        {
            to: mail,
            subject: "Mail Doğrulama",
            html: `<h1>Mail Doğrulama</h1><p>Merhaba ${username},</p><p>Mail adresini doğrulamak için <a href="${config.url}/auth/verify?code=${user.mail.code}">buraya</a> tıkla.</p>`
        })
        
        if(!data.status) {
            return { status: false, message: `Merhaba ${username}, mail sistemi şu anda çalışmıyor. Lütfen yöneticiye şu mesajı gönderin: ${data.message}`}
        } else {
            user.logs.push({ ip: "System", date: dayjs().format("YYYY-MM-DD HH:mm:ss"), action: "Register", status: "Success", details: "", userID: user.id });
            await user.save();
            return { status: true, message: "Kayıt başarılı.", data: user };
        }
    } catch (e) {
        return { status: false, message: `Merhaba ${username}, mail sistemi şu anda çalışmıyor. Lütfen yöneticiye şu mesajı gönderin: ${e}`}
    }
};

user.statics.login = async function({ username, password, ip }) {
    let user = await this.findOne({ username: username });
    if (!user) return { status: false, message: "Böyle bir kullanıcı bulunamadı."}
    if(user.password != md5(password + config.salt)) {
        user.logs.push({ ip: ip, date: dayjs().format("YYYY-MM-DD HH:mm:ss"), action: "Login", status: "Failed", details: "Wrong password.", userID: user.id });
        await user.save();
        return { status: false, message: "Şifre yanlış."}
    }
    if (user.ban.status) {
        user.logs.push({ ip: ip, date: dayjs().format("YYYY-MM-DD HH:mm:ss"), action: "Login", status: "Failed", details: "Banned.", userID: user.id });
        await user.save();
        return { status: false, message: "Bu hesap banlı."}
    }
    user.logs.push({ ip: ip, date: dayjs().format("YYYY-MM-DD HH:mm:ss"), action: "Login", status: "Success", details: "", userID: user.id });
    await user.save();
    return { status: true, message: "Giriş başarılı.", data: user };
};

user.statics.changePassword = async function({ id, password, newPassword, ip }) {
    let user = await this.findOne({ id: id });
    if (!user) return { status: false, message: "Böyle bir kullanıcı bulunamadı."}
    user.password = md5(newPassword + config.salt);
    user.logs.push({ ip: ip, date: dayjs().format("YYYY-MM-DD HH:mm:ss"), action: "Change Password", status: "Success", details: "", userID: user.id });
    await user.save();
    return { status: true, message: "Şifre değiştirildi."};
};

user.statics.changeMail = async function({ id, mail, ip }) {
    let user = await this.findOne({ id: id });
    if (!user) return { status: false, message: "Böyle bir kullanıcı bulunamadı."}
    user.mail.address = mail;
    user.logs.push({ ip: ip, date: dayjs().format("YYYY-MM-DD HH:mm:ss"), action: "Change Mail", status: "Success", details: `Old Mail: ${user.mail.address}, New Mail: ${mail}`, userID: user.id });
    await user.save();
    return { status: true, message: "Mail değiştirildi."};
};

user.statics.verifyMail = async function({ id, code }) {
    let user = await this.findOne({ id: Number(id) });
    if (!user) return { status: false, message: "Böyle bir kullanıcı bulunamadı."}
    if (user.mail.code != code) return { status: false, message: "Doğrulama kodu yanlış."}
    user.mail.status = true;
    user.logs.push({ ip: "System", date: dayjs().format("YYYY-MM-DD HH:mm:ss"), action: "Verify Mail", status: "Success", details: `Old Status: ${user.mail.status}, New Status: true`, userID: user.id });
    await user.save();
    return { status: true, message: "Mail adresi doğrulandı." };
};

user.statics.changePhone = async function({ id, phone, ip }) {
    let user = await this.findOne({ id: id });
    if (!user) return { status: false, message: "Böyle bir kullanıcı bulunamadı."}
    user.phone.number = phone;
    user.logs.push({ ip: ip, date: dayjs().format("YYYY-MM-DD HH:mm:ss"), action: "Change Phone", status: "Success", details: `Old Phone: ${user.phone.number}, New Phone: ${phone}`, userID: user.id });
    await user.save();
    return { status: true, message: "Telefon değiştirildi."};
};

user.statics.changePerson = async function({ id, name, surname, country, city, address, zip, birth, ip }) {
    let user = await this.findOne({ id: id });
    if (!user) return { status: false, message: "Böyle bir kullanıcı bulunamadı."}
    user.person.name = name;
    user.person.surname = surname;
    user.person.country = country;
    user.person.city = city;
    user.person.address = address;
    user.person.zip = zip;
    user.person.birth = birth;
    user.logs.push({ ip: ip, date: dayjs().format("YYYY-MM-DD HH:mm:ss"), action: "Change Person", status: "Success", details: `Old Person: ${user.person}, New Person: ${name} ${surname} ${country} ${city} ${address} ${zip} ${birth}`, userID: user.id });
    await user.save();
    return { status: true, message: "Kişisel bilgiler değiştirildi."};
};

user.statics.changeApi = async function({ id, status, ip }) {
    let user = await this.findOne({ id: id });
    if (!user) return { status: false, message: "Böyle bir kullanıcı bulunamadı."}
    user.api.status = status;
    user.logs.push({ ip: ip, date: dayjs().format("YYYY-MM-DD HH:mm:ss"), action: "Change API", status: "Success", details: `Old Status: ${user.api.status}, New Status: ${status}`, userID: user.id });
    await user.save();
    return { status: true, message: "API durumu değiştirildi."};
};


user.statics.changeRole = async function({ id, role, ip }) {
    let user = await this.findOne({ id: id });
    if (!user) return { status: false, message: "Böyle bir kullanıcı bulunamadı."}
    user.role = role;
    user.logs.push({ ip: ip, date: dayjs().format("YYYY-MM-DD HH:mm:ss"), action: "Change Role", status: "Success", details: `Old Role: ${user.role}, New Role: ${role}`, userID: user.id });
    await user.save();
    return { status: true, message: "Rol değiştirildi."};
};

user.statics.changeBan = async function({ id, status, reason, admin, ip }) {
    let user = await this.findOne({ id: id });
    if (!user) return { status: false, message: "Böyle bir kullanıcı bulunamadı."}
    user.ban.status = status;
    user.ban.reason = reason;
    user.ban.admin = admin;
    user.ban.date = dayjs().format("YYYY-MM-DD HH:mm:ss");
    user.logs.push({ ip: ip, date: dayjs().format("YYYY-MM-DD HH:mm:ss"), action: "Ban", status: "Success", details: `Old Ban Status: ${user.ban}, New Ban: ${status} ${reason} ${admin} ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`, userID: user.id });
    await user.save();
    return { status: true, message: "Ban değiştirildi."};
};

user.statics.addBalance = async function({ id, amount, details }) {
    let user = await this.findOne({ id: id });
    if (!user) return { status: false, message: "Böyle bir kullanıcı bulunamadı."}
    user.balance += amount;
    user.logs.push({ ip: "System", date: dayjs().format("YYYY-MM-DD HH:mm:ss"), action: "Add Balance", status: "Success", details: details, userID: user.id });
    await user.save();
    return { status: true, message: "Bakiye eklendi."};
};

user.statics.spendBalance = async function({ id, amount, details }) {
    let user = await this.findOne({ id: id });
    if (!user) return { status: false, message: "Böyle bir kullanıcı bulunamadı."}
    if (user.balance < amount) return { status: false, message: "Yetersiz bakiye."}
    user.balance -= amount;
    user.spent += amount;
    user.logs.push({ ip: "System", date: dayjs().format("YYYY-MM-DD HH:mm:ss"), action: "Spend Balance", status: "Success", details: details, userID: user.id });
    await user.save();
    return { status: true, message: "Bakiye harcandı."};
};

user.statics.checkAuth = async function({ id, password }) {
    user = await this.findOne({ id: id });
    if (!user) return { status: false, message: "Böyle bir kullanıcı bulunamadı." };
    if(!user.mail.status) return { status: false, message: "Mail adresi doğrulanmamış." };
    if(user.ban.status) return { status: false, message: `Bu hesap banlı. Sebep: ${user.ban.reason} Banlayan: ${user.ban.admin} Ban Tarihi: ${user.ban.date}` };
    return { status: true, message: "Giriş başarılı.", data: user };
};

module.exports = mongoose.model("User", user);