// js/app.js (เวอร์ชันสมบูรณ์)
document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split("/").pop();
    
    if (page === 'index.html' || page === '') { loadLatestNews(); }
    if (page === 'news.html') { loadAllNews(); }
    if (page === 'news-detail.html') { loadNewsDetail(); }
    if (page === 'activities.html') { loadAllActivities(); }
    if (page === 'activity-detail.html') { loadActivityDetail(); }
    if (page === 'announcements.html') { loadAllAnnouncements(); }
    if (page === 'announcement-detail.html') { loadAnnouncementDetail(); }
    if (page === 'about.html') { loadAllCommitteeMembers(); }
    if (page === 'downloads.html') { loadAllDownloads(); }
});

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function createPlaceholder(message) {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-message';
    placeholder.textContent = message;
    return placeholder;
}

function getUrlParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function loadLatestNews() {
    const container = document.getElementById('latest-news-container');
    if (!container) return;
    const newsData = dataManager.getData('news').filter(item => item.published).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    container.innerHTML = '';
    if (newsData.length === 0) { container.appendChild(createPlaceholder('ยังไม่มีข่าวสารในขณะนี้')); return; }
    newsData.forEach(news => {
        const card = document.createElement('div');
        card.className = 'card no-image';
        card.innerHTML = `<div class="card-content"><p class="card-date">${formatDate(news.date)}</p><h3>${news.title}</h3><p>${news.content.substring(0, 100)}...</p><a href="news-detail.html?id=${news.id}">อ่านต่อ</a></div>`;
        container.appendChild(card);
    });
}

function loadAllNews() {
    const container = document.getElementById('news-list-container');
    if (!container) return;
    const newsData = dataManager.getData('news').filter(item => item.published).sort((a, b) => new Date(b.date) - new Date(a.date));
    container.innerHTML = '';
    if (newsData.length === 0) { container.appendChild(createPlaceholder('ยังไม่มีข่าวสารในขณะนี้')); return; }
    newsData.forEach(news => {
        const card = document.createElement('div');
        card.className = 'card no-image';
        card.innerHTML = `<div class="card-content"><p class="card-date">${formatDate(news.date)}</p><h3>${news.title}</h3><p>${news.content.substring(0, 120)}...</p><a href="news-detail.html?id=${news.id}">อ่านรายละเอียด</a></div>`;
        container.appendChild(card);
    });
}

function loadAllActivities() {
    const container = document.getElementById('activities-list-container');
    if (!container) return;
    const activitiesData = dataManager.getData('activities').reverse();
    container.innerHTML = '';
    if (activitiesData.length === 0) { container.appendChild(createPlaceholder('ยังไม่มีกิจกรรมในขณะนี้')); return; }
    activitiesData.forEach(activity => {
        const card = document.createElement('div');
        card.className = 'card no-image';
        card.innerHTML = `<div class="card-content"><h3>${activity.title}</h3><p>${activity.description.substring(0, 120)}...</p><a href="activity-detail.html?id=${activity.id}">ดูรายละเอียดกิจกรรม</a></div>`;
        container.appendChild(card);
    });
}

function loadAllAnnouncements() {
    const container = document.getElementById('announcements-list-container');
    if (!container) return;
    const announcementsData = dataManager.getData('announcements').sort((a, b) => new Date(b.date) - new Date(a.date));
    container.innerHTML = '';
    if (announcementsData.length === 0) { container.appendChild(createPlaceholder('ยังไม่มีประกาศในขณะนี้')); return; }
    announcementsData.forEach(announcement => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `
            <span class="date">ประกาศ ณ ${formatDate(announcement.date)}</span>
            <h3>เรื่อง: ${announcement.title}</h3>
            <p>คลิกเพื่อดูรายละเอียดประกาศ</p>
            <a href="announcement-detail.html?id=${announcement.id}" class="btn">ดูประกาศ</a>
        `;
        container.appendChild(item);
    });
}

function loadAllDownloads() {
    const container = document.getElementById('downloads-list-container');
    if (!container) return;
    const downloadsData = dataManager.getData('downloads');
    container.innerHTML = '';
    if (downloadsData.length === 0) { container.appendChild(createPlaceholder('ยังไม่มีเอกสารให้ดาวน์โหลด')); return; }
    downloadsData.forEach(download => {
        const item = document.createElement('div');
        item.className = 'download-item';
        item.innerHTML = `<div class="download-icon"><i class="fas fa-link"></i></div><div class="download-info"><h3>${download.title}</h3><p>ลิงก์ไปยัง Google Drive</p></div><a href="${download.url}" class="download-btn" target="_blank"><i class="fas fa-external-link-alt"></i> เปิดลิงก์</a>`;
        container.appendChild(item);
    });
}

function loadNewsDetail() {
    const container = document.getElementById('news-detail-container');
    if (!container) return;
    const newsId = getUrlParameter('id');
    const news = dataManager.findItemById('news', newsId);
    if (!news) { container.innerHTML = '<p class="placeholder-message">ไม่พบข่าวสารที่คุณค้นหา</p>'; return; }
    document.title = `${news.title} - สโมสรนิสิตนิติศาสตร์`;
    let embedHtml = news.facebookEmbed ? `<div class="facebook-embed-container">${news.facebookEmbed}</div>` : '';
    container.innerHTML = `<h1 class="detail-title">${news.title}</h1><p class="detail-date">เผยแพร่เมื่อ: ${formatDate(news.date)}</p>${embedHtml}<div class="detail-content"><p>${news.content.replace(/\n/g, '<br>')}</p></div><a href="news.html" class="back-link">&larr; กลับไปหน้าข่าวสารทั้งหมด</a>`;
    if (window.FB) { FB.XFBML.parse(container); }
}

function loadActivityDetail() {
    const container = document.getElementById('activity-detail-container');
    if (!container) return;
    const activityId = getUrlParameter('id');
    const activity = dataManager.findItemById('activities', activityId);
    if (!activity) { container.innerHTML = '<p class="placeholder-message">ไม่พบกิจกรรมที่คุณค้นหา</p>'; return; }
    document.title = `${activity.title} - สโมสรนิสิตนิติศาสตร์`;
    let embedHtml = activity.facebookEmbed ? `<div class="facebook-embed-container">${activity.facebookEmbed}</div>` : '';
    container.innerHTML = `<h1 class="detail-title">${activity.title}</h1><div class="detail-content"><p>${activity.description.replace(/\n/g, '<br>')}</p></div>${embedHtml}<a href="activities.html" class="back-link">&larr; กลับไปหน้ากิจกรรมทั้งหมด</a>`;
    if (window.FB) { FB.XFBML.parse(container); }
}

function loadAnnouncementDetail() {
    const container = document.getElementById('announcement-detail-container');
    if (!container) return;
    const announcementId = getUrlParameter('id');
    const announcement = dataManager.findItemById('announcements', announcementId);
    if (!announcement) { container.innerHTML = '<p class="placeholder-message">ไม่พบประกาศที่คุณค้นหา</p>'; return; }
    document.title = `เรื่อง: ${announcement.title} - สโมสรนิสิตนิติศาสตร์`;
    // แปลง URL ของ Google Drive ให้อยู่ในรูปแบบ embed
    const embedUrl = announcement.url.replace("/view", "/preview");
    container.innerHTML = `
        <h1 class="detail-title">เรื่อง: ${announcement.title}</h1>
        <p class="detail-date">ประกาศ ณ วันที่: ${formatDate(announcement.date)}</p>
        <div class="gdrive-embed-container">
            <iframe src="${embedUrl}"></iframe>
        </div>
        <a href="announcements.html" class="back-link">&larr; กลับไปหน้าประกาศทั้งหมด</a>
    `;
}

function loadAllCommitteeMembers() {
    const committeeData = dataManager.getData('committee');
    const presidentContainer = document.getElementById('president-container');
    const vpContainer = document.getElementById('vp-container');
    const otherMembersContainer = document.getElementById('other-members-container');
    const committeeSection = document.getElementById('committee-section');
    if (!presidentContainer || !vpContainer || !otherMembersContainer || !committeeSection) return;
    const president = committeeData.find(m => m.mainPosition === 'นายกสโมสรนิสิต');
    const vicePresidents = committeeData.filter(m => m.mainPosition === 'อุปนายกฝ่ายใน' || m.mainPosition === 'อุปนายกฝ่ายนอก').sort((a, b) => a.name.localeCompare(b.name, 'th'));
    const otherMembers = committeeData.filter(m => m.mainPosition === 'กรรมการ').sort((a, b) => a.name.localeCompare(b.name, 'th'));
    if (committeeData.length === 0) { committeeSection.style.display = 'none'; return; }
    const createCommitteeCard = (member) => {
        let fullPosition = '';
        if (member.mainPosition === 'นายกสโมสรนิสิต') {
            fullPosition = 'นายกสโมสรนิสิต สาขาวิชานิติศาสตร์<br>มหาวิทยาลัยมหาจุฬาลงกรณ์ราชวิทยาลัย วิทยาเขตแพร่';
        } else if (member.mainPosition === 'อุปนายกฝ่ายใน' || member.mainPosition === 'อุปนายกฝ่ายนอก') {
            fullPosition = `${member.mainPosition} สาขาวิชานิติศาสตร์<br>มหาวิทยาลัยมหาจุฬาลงกรณ์ราชวิทยาลัย วิทยาเขตแพร่`;
        } else if (member.mainPosition === 'กรรมการ' && member.department) {
            fullPosition = member.department;
        } else {
            fullPosition = member.mainPosition;
        }
        return `<div class="committee-card"><img src="${member.image || 'https://via.placeholder.com/320x400/fce4ec/b91c5c?text=Profile'}" alt="รูปภาพ${member.name}"><div class="card-content"><h3>${member.name}</h3><p class="position">${fullPosition}</p></div></div>`;
    };
    presidentContainer.innerHTML = president ? createCommitteeCard(president) : '';
    vpContainer.innerHTML = vicePresidents.map(createCommitteeCard).join('');
    const subtitle = document.querySelector('.section-subtitle');
    if (otherMembers.length > 0) {
        if (subtitle) subtitle.style.display = 'block';
        otherMembersContainer.innerHTML = otherMembers.map(createCommitteeCard).join('');
    } else {
        if (subtitle) subtitle.style.display = 'none';
    }
}