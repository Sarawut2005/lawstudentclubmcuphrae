// admin/admin-dashboard.js (เวอร์ชันสมบูรณ์)
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('adminLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    const modal = document.getElementById('formModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('dataForm');
    
    loadAllData();
    
    document.querySelectorAll('.admin-sidebar a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            document.querySelectorAll('.admin-sidebar a').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
        });
    });
    
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'login.html';
    });
    
    document.getElementById('addNewsBtn').addEventListener('click', () => showForm('news'));
    document.getElementById('addActivityBtn').addEventListener('click', () => showForm('activities'));
    document.getElementById('addAnnouncementBtn').addEventListener('click', () => showForm('announcements'));
    document.getElementById('addCommitteeBtn').addEventListener('click', () => showForm('committee'));
    document.getElementById('addDownloadBtn').addEventListener('click', () => showForm('downloads'));
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveData();
    });
    
    function loadAllData() {
        loadNews();
        loadActivities();
        loadAnnouncements();
        loadCommittee();
        loadDownloads();
    }
    
    function loadNews() {
        const news = dataManager.getData('news');
        const tbody = document.getElementById('newsTableBody');
        tbody.innerHTML = '';
        news.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${item.title}</td><td>${formatDate(item.date)}</td><td><span class="status ${item.published ? 'published' : 'draft'}">${item.published ? 'เผยแพร่แล้ว' : 'แบบร่าง'}</span></td><td><button class="btn btn-sm btn-edit" data-id="${item.id}" data-type="news">แก้ไข</button><button class="btn btn-sm btn-danger" data-id="${item.id}" data-type="news">ลบ</button></td>`;
            tbody.appendChild(tr);
        });
        addEditDeleteListeners('news');
    }
    
    function loadActivities() {
        const activities = dataManager.getData('activities');
        const tbody = document.getElementById('activitiesTableBody');
        tbody.innerHTML = '';
        activities.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${item.title}</td><td>${item.description ? item.description.substring(0, 50) : ''}...</td><td><button class="btn btn-sm btn-edit" data-id="${item.id}" data-type="activities">แก้ไข</button><button class="btn btn-sm btn-danger" data-id="${item.id}" data-type="activities">ลบ</button></td>`;
            tbody.appendChild(tr);
        });
        addEditDeleteListeners('activities');
    }
    
    function loadAnnouncements() {
        const announcements = dataManager.getData('announcements');
        const tbody = document.getElementById('announcementsTableBody');
        tbody.innerHTML = '';
        announcements.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${item.title}</td><td>${formatDate(item.date)}</td><td><button class="btn btn-sm btn-edit" data-id="${item.id}" data-type="announcements">แก้ไข</button><button class="btn btn-sm btn-danger" data-id="${item.id}" data-type="announcements">ลบ</button></td>`;
            tbody.appendChild(tr);
        });
        addEditDeleteListeners('announcements');
    }
    
    function loadCommittee() {
        const committee = dataManager.getData('committee');
        const tbody = document.getElementById('committeeTableBody');
        tbody.innerHTML = '';
        const sortedCommittee = committee.sort((a, b) => {
            const order = { "นายกสโมสรนิสิต": 1, "อุปนายกฝ่ายใน": 2, "อุปนายกฝ่ายนอก": 2, "กรรมการ": 3 };
            return (order[a.mainPosition] || 4) - (order[b.mainPosition] || 4);
        });
        sortedCommittee.forEach(item => {
            const tr = document.createElement('tr');
            let fullPosition = item.mainPosition;
            if (item.department) { fullPosition += ` (${item.department})`; }
            tr.innerHTML = `<td>${item.name}</td><td>${fullPosition}</td><td><button class="btn btn-sm btn-edit" data-id="${item.id}" data-type="committee">แก้ไข</button><button class="btn btn-sm btn-danger" data-id="${item.id}" data-type="committee">ลบ</button></td>`;
            tbody.appendChild(tr);
        });
        addEditDeleteListeners('committee');
    }
    
    function loadDownloads() {
        const downloads = dataManager.getData('downloads');
        const tbody = document.getElementById('downloadsTableBody');
        tbody.innerHTML = '';
        downloads.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${item.title}</td><td><a href="${item.url}" target="_blank">ดูลิงก์</a></td><td><button class="btn btn-sm btn-edit" data-id="${item.id}" data-type="downloads">แก้ไข</button><button class="btn btn-sm btn-danger" data-id="${item.id}" data-type="downloads">ลบ</button></td>`;
            tbody.appendChild(tr);
        });
        addEditDeleteListeners('downloads');
    }
    
    function addEditDeleteListeners(type) {
        document.querySelectorAll(`#${type} .btn-edit`).forEach(btn => {
            btn.addEventListener('click', function() { editItem(type, this.getAttribute('data-id')); });
        });
        document.querySelectorAll(`#${type} .btn-danger`).forEach(btn => {
            btn.addEventListener('click', function() { deleteItem(type, this.getAttribute('data-id')); });
        });
    }
    
    function showForm(type, id = null) {
        const modalTitle = document.getElementById('modalTitle');
        const formFields = document.getElementById('formFields');
        document.getElementById('itemId').value = id || '';
        document.getElementById('itemType').value = type;
        modalTitle.textContent = id ? `แก้ไข${getTypeName(type)}` : `เพิ่ม${getTypeName(type)}ใหม่`;
        formFields.innerHTML = createFormFields(type, id);
        modal.style.display = 'block';
    }

    function createFormFields(type, id) {
        let fields = '';
        let item = id ? dataManager.findItemById(type, id) : null;
        const createFacebookEmbedField = (item) => `<div class="form-group"><label for="facebookEmbed">โค้ดฝังโพสต์ Facebook</label><textarea id="facebookEmbed" rows="6">${item && item.facebookEmbed ? item.facebookEmbed : ''}</textarea><small>ไปที่โพสต์ Facebook > ... > ฝัง (Embed) > คัดลอกโค้ดมาวาง</small></div>`;

        switch(type) {
            case 'news':
                fields = `<div class="form-group"><label for="newsTitle">หัวข้อข่าว</label><input type="text" id="newsTitle" value="${item ? item.title : ''}" required></div><div class="form-group"><label for="newsDate">วันที่</label><input type="date" id="newsDate" value="${item ? item.date : ''}" required></div><div class="form-group"><label for="newsContent">เนื้อหา</label><textarea id="newsContent" rows="5" required>${item ? item.content : ''}</textarea></div>${createFacebookEmbedField(item)}<div class="form-group"><label class="checkbox-container"><input type="checkbox" id="newsPublished" ${item && item.published ? 'checked' : ''}> เผยแพร่</label></div>`;
                break;
            case 'activities':
                fields = `<div class="form-group"><label for="activityTitle">ชื่อกิจกรรม</label><input type="text" id="activityTitle" value="${item ? item.title : ''}" required></div><div class="form-group"><label for="activityDescription">คำอธิบาย</label><textarea id="activityDescription" rows="4" required>${item ? item.description : ''}</textarea></div>${createFacebookEmbedField(item)}`;
                break;
            case 'announcements':
                fields = `<div class="form-group"><label for="announcementTitle">หัวข้อประกาศ</label><input type="text" id="announcementTitle" value="${item ? item.title : ''}" required></div><div class="form-group"><label for="announcementDate">วันที่ประกาศ</label><input type="date" id="announcementDate" value="${item ? item.date : ''}" required></div><div class="form-group"><label for="announcementUrl">ลิงก์แชร์จาก Google Drive</label><input type="url" id="announcementUrl" value="${item ? item.url : ''}" placeholder="https://docs.google.com/..." required><small>วิธีเอาลิงก์: ไปที่ไฟล์ใน Google Drive > คลิกขวา > แชร์ (Share) > ตั้งค่า "ทุกคนที่มีลิงก์" (Anyone with the link) > คัดลอกลิงก์</small></div>`;
                break;
            case 'committee':
                 fields = `<div class="form-group"><label for="committeeName">ชื่อ-นามสกุล</label><input type="text" id="committeeName" value="${item ? item.name : ''}" required></div><div class="form-group"><label for="committeeMainPosition">ตำแหน่งหลัก</label><select id="committeeMainPosition"><option value="นายกสโมสรนิสิต" ${item && item.mainPosition === 'นายกสโมสรนิสิต' ? 'selected' : ''}>นายกสโมสรนิสิต</option><option value="อุปนายกฝ่ายใน" ${item && item.mainPosition === 'อุปนายกฝ่ายใน' ? 'selected' : ''}>อุปนายกฝ่ายใน</option><option value="อุปนายกฝ่ายนอก" ${item && item.mainPosition === 'อุปนายกฝ่ายนอก' ? 'selected' : ''}>อุปนายกฝ่ายนอก</option><option value="กรรมการ" ${item && item.mainPosition === 'กรรมการ' ? 'selected' : ''}>กรรมการ (ฝ่ายอื่นๆ)</option></select></div><div class="form-group"><label for="committeeDepartment">ฝ่าย / แผนก (ถ้ามี)</label><input type="text" id="committeeDepartment" value="${item ? item.department : ''}" placeholder="เช่น ฝ่ายวิชาการ"></div><div class="form-group"><label for="committeeImage">URL รูปภาพ</label><input type="text" id="committeeImage" value="${item ? item.image : ''}"></div>`;
                break;
            case 'downloads':
                fields = `<div class="form-group"><label for="downloadTitle">หัวข้อเรื่อง</label><input type="text" id="downloadTitle" value="${item ? item.title : ''}" required></div><div class="form-group"><label for="downloadUrl">ลิงก์แชร์จาก Google Drive</label><input type="url" id="downloadUrl" value="${item ? item.url : ''}" placeholder="https://docs.google.com/..." required><small>วิธีเอาลิงก์: ไปที่ไฟล์ใน Google Drive > คลิกขวา > แชร์ (Share) > ตั้งค่า "ทุกคนที่มีลิงก์" (Anyone with the link) > คัดลอกลิงก์</small></div>`;
                break;
        }
        return fields;
    }

    function saveData() {
        const type = document.getElementById('itemType').value;
        const id = document.getElementById('itemId').value;
        let itemData = {};
        
        switch(type) {
            case 'news':
                itemData = { title: document.getElementById('newsTitle').value, date: document.getElementById('newsDate').value, content: document.getElementById('newsContent').value, facebookEmbed: document.getElementById('facebookEmbed').value, published: document.getElementById('newsPublished').checked };
                break;
            case 'activities':
                itemData = { title: document.getElementById('activityTitle').value, description: document.getElementById('activityDescription').value, facebookEmbed: document.getElementById('facebookEmbed').value };
                break;
            case 'announcements':
                itemData = { title: document.getElementById('announcementTitle').value, date: document.getElementById('announcementDate').value, url: document.getElementById('announcementUrl').value };
                break;
            case 'committee':
                itemData = { name: document.getElementById('committeeName').value, mainPosition: document.getElementById('committeeMainPosition').value, department: document.getElementById('committeeDepartment').value, image: document.getElementById('committeeImage').value };
                break;
            case 'downloads':
                itemData = { title: document.getElementById('downloadTitle').value, url: document.getElementById('downloadUrl').value };
                break;
        }
        
        if (id) {
            dataManager.updateItem(type, id, itemData);
        } else {
            dataManager.addItem(type, itemData);
        }
        
        loadAllData();
        closeModal();
        alert('บันทึกข้อมูลเรียบร้อยแล้ว');
    }

    function editItem(type, id) { showForm(type, id); }
    
    function deleteItem(type, id) {
        if (confirm('คุณแน่ใจว่าต้องการลบข้อมูลนี้?')) {
            dataManager.deleteItem(type, id);
            loadAllData();
            alert('ลบข้อมูลเรียบร้อยแล้ว');
        }
    }
    
    function closeModal() {
        modal.style.display = 'none';
        form.reset();
    }
    
    function getTypeName(type) {
        const names = { 'news': 'ข่าวสาร', 'activities': 'กิจกรรม', 'announcements': 'ประกาศ', 'committee': 'คณะกรรมการ', 'downloads': 'เอกสารดาวน์โหลด' };
        return names[type] || 'ข้อมูล';
    }
    
    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH');
    }
});