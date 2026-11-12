/**
 * =========================================================================
 * KHỐI CẤU HÌNH TRUNG TÂM (DÙNG CHUNG CHO MỌI DỰ ÁN)
 * =========================================================================
 */
const PROJECT_CONFIG = {
    // 1. Tiêu đề hiển thị
    pageTitle: "An Phong - Andora City",
    headerTitle: "QUẢN LÝ THÔNG TIN QUỸ ĐẤT DỰ ÁN",
    headerSubtitle: "Khu đô thị An Phong - Andora City",

    // 2. Đường dẫn Dữ liệu & Bản đồ
    scriptUrl: "https://script.google.com/macros/s/AKfycbxDOEsv6D4A1uTNd3hGrmjB8QUwRMLqPI-RqPltOV2ZY83ghlgDwQbGwdOS6qCunex-/exec", 
    svgPath: "assets/svg/map.svg",
    bgImagePath: "assets/images/bg-lumera.jpg", // Thay đúng tên file ảnh nền của bạn

    // 3. Số điện thoại Zalo nhận liên hệ
    zaloPhone: "0858290389",

    // Tự động chỉ hiện trong Bảng chú thích những Loại đất thực sự có mặt trong dữ liệu dự án
    autoDetectLegend: true,

    // 4. Danh mục các đối tượng LOẠI ĐẤT (Khai báo thoải mái nhiều mẫu cho mọi dự án)
    // - prefix: Ký hiệu đầu của Mã lô (VD: "LK", "BT", "SH", "HH", "NV"...)
    // - name: Tên ngắn gọn để ghép với Mã thiết kế trong Popup (VD: "Liền kề (M24)")
    // - label: Tên đầy đủ hiển thị ở Bảng chú thích góc dưới
    // - color: Mã màu đại diện
    // - autoFillSvg: Để false nếu file SVG đã tô màu sẵn từ AI; để true nếu muốn Web tự tô màu lô đất theo loại!
    landTypes: [
        { 
            prefix: "LK", 
            keywords: ["liền kề", "lien ke"], 
            name: "Liền kề", 
            label: "Đất ở liền kề", 
            color: "#00aeef", 
            autoFillSvg: true,
            showInLegend: true
        },
        { 
            prefix: "HH", 
            keywords: ["hỗn hợp", "hon hop", "kết hợp kinh doanh"], 
            name: "Hỗn Hợp", 
            label: "Đất ở kết hợp kinh doanh", 
            color: "#4caf50", 
            autoFillSvg: true,
            showInLegend: true
        },
        { 
            prefix: "BT", 
            keywords: ["biệt thự", "biet thu"], 
            name: "Biệt thự", 
            label: "Đất ở biệt thự", 
            color: "#fbbc04", 
            autoFillSvg: false,
            showInLegend: true
        },
        { 
            prefix: "SH", 
            keywords: ["shophouse", "thương mại"], 
            name: "Shophouse", 
            label: "Nhà phố thương mại", 
            color: "#9b59b6", 
            autoFillSvg: false,
            showInLegend: true
        }
    // Ví dụ khi dự án mới có thêm Shophouse hoặc Đất nền, chỉ cần bỏ comment dòng dưới:
    // { prefix: "SH", keywords: ["shophouse", "thương mại"], name: "Shophouse", label: "Nhà phố thương mại", color: "#9b59b6", autoFillSvg: false, showInLegend: true },
    ],

    // 5. Quản lý đối tượng TÌNH TRẠNG BÁN HÀNG
    // - keywords: Các cụm từ có thể xuất hiện trong cột Trạng thái trên Google Sheet (không phân biệt hoa/thường)
    // - label: Tên hiển thị trên Bảng chú thích
    // - mapColor: Màu tô đè lên lô đất trên bản đồ (Để null nếu muốn giữ nguyên màu gốc của Loại đất)
    // - textColor: Màu chữ của dòng Tình trạng bên trong bảng Popup
    // - showInLegend: true = hiển thị ô màu ở Bảng chú thích; false = ẩn khỏi Bảng chú thích
    salesStatuses: [
        { 
            keywords: ["đang bán", "dang ban", "mở bán", "còn trống", "available"], 
            label: "Đang bán", 
            mapColor: null,         
            textColor: "#27ae60",   
            showInLegend: false 
        },
        { 
            keywords: ["đã bán", "da ban", "sold"], 
            label: "Đã bán", 
            mapColor: "#7f8c8d",    
            textColor: "#7f8c8d", 
            showInLegend: true 
        },
        { 
            keywords: ["đặt cọc", "dat coc", "đang cọc", "booked"], 
            label: "Đặt cọc", 
            mapColor: "#f1c40f",    
            textColor: "#f39c12", 
            showInLegend: true 
        },
        { 
            keywords: ["giữ chỗ", "giu cho", "lock"], 
            label: "Giữ chỗ", 
            mapColor: "#e74c3c",    
            textColor: "#e74c3c", 
            showInLegend: false 
        },
        { 
            keywords: ["chưa có thông tin", "chưa mở bán", "đang cập nhật"], 
            label: "Chưa có thông tin", 
            mapColor: null,         
            textColor: "#7f8c8d", 
            showInLegend: false 
        }
    ]
};

let dataBDS = {}; 
const infoBox = document.getElementById('info-box');

// Khởi tạo giao diện tĩnh & tự động bổ sung dòng Tầng 5 nếu index.html chưa có
ensureFloorRowsInDOM();
initStaticUI();

// Tải ĐỒNG THỜI file SVG và dữ liệu JSON từ Google Sheets
Promise.all([
    fetch(PROJECT_CONFIG.svgPath).then(response => {
        if (!response.ok) throw new Error("Không tìm thấy file SVG: " + PROJECT_CONFIG.svgPath);
        return response.text();
    }),
    fetch(PROJECT_CONFIG.scriptUrl).then(response => response.json())
])
.then(([svgContent, data]) => {
    const wrapper = document.getElementById('map-wrapper');
    wrapper.innerHTML = svgContent;
    
    const svgViewBoxWidth = prepareSvgAndBackground(wrapper);
    dataBDS = data; 
    
    // Cập nhật lại Bảng chú thích dựa trên các loại đất thực tế có trong dự án (nếu bật autoDetectLegend)
    if (PROJECT_CONFIG.autoDetectLegend) {
        renderLegend(dataBDS);
    }

    initMap(svgViewBoxWidth);      
    initZoom();     
})
.catch(error => {
    console.error("Lỗi khởi tạo:", error);
    alert("Không thể tải dữ liệu hoặc bản đồ. Vui lòng kiểm tra lại đường dẫn file SVG hoặc link Apps Script!");
});

/**
 * TỰ ĐỘNG BỔ SUNG DÒNG TẦNG 5 VÀO HTML NẾU FILE INDEX.HTML CŨ CHƯA CÓ
 */
function ensureFloorRowsInDOM() {
    const floorDetails = document.getElementById('floor-details');
    if (!floorDetails) return;

    // Nếu chưa có thẻ #t5, tự động chèn dòng Tầng 5 vào ngay sau Tầng 4 (trước dòng Tổng diện tích sàn)
    if (!document.getElementById('t5')) {
        const t4El = document.getElementById('t4');
        const t4Row = t4El ? t4El.closest('.info-row') : null;
        
        const t5Row = document.createElement('div');
        t5Row.className = 'info-row';
        t5Row.innerHTML = '<span>Tầng 5:</span> <b id="t5"></b>';

        if (t4Row && t4Row.nextSibling) {
            floorDetails.insertBefore(t5Row, t4Row.nextSibling);
        } else {
            floorDetails.appendChild(t5Row);
        }
    }
}

/**
 * HÀM VẼ BẢNG CHÚ THÍCH (HỖ TRỢ LỌC TỰ ĐỘNG THEO DỮ LIỆU DỰ ÁN)
 */
function renderLegend(lotData = null) {
    const typesContainer = document.getElementById('legend-types');
    const fallbackLegendGrid = document.querySelector('.legend-grid');

    const activeTypes = PROJECT_CONFIG.landTypes.filter(item => {
        if (item.showInLegend === false) return false;
        if (!lotData || !PROJECT_CONFIG.autoDetectLegend) return true;
        // Chỉ hiện trên Chú thích nếu trong dữ liệu dự án có ít nhất 1 lô khớp prefix
        return Object.keys(lotData).some(id => item.prefix && id.toUpperCase().startsWith(item.prefix.toUpperCase()));
    });

    const typesHtml = activeTypes
        .map(item => `<div class="legend-item"><span class="color-box" style="background: ${item.color};"></span> ${item.label}</div>`)
        .join('');

    const statusHtml = PROJECT_CONFIG.salesStatuses
        .filter(item => item.showInLegend !== false && item.mapColor)
        .map(item => `<div class="legend-item"><span class="color-box" style="background: ${item.mapColor};"></span> ${item.label}</div>`)
        .join('');

    if (typesContainer && document.getElementById('legend-statuses')) {
        typesContainer.innerHTML = typesHtml;
        document.getElementById('legend-statuses').innerHTML = statusHtml;
    } else if (fallbackLegendGrid) {
        fallbackLegendGrid.innerHTML = `
            <div class="legend-col">${typesHtml}</div>
            <div class="legend-col">${statusHtml}</div>
        `;
    }
}

/**
 * HÀM KHỞI TẠO TIÊU ĐỀ, CHÚ THÍCH & NÚT ZALO
 */
function initStaticUI() {
    document.title = PROJECT_CONFIG.pageTitle;
    const hTitle = document.getElementById('header-title');
    const hSub = document.getElementById('header-subtitle');
    if (hTitle) hTitle.innerText = PROJECT_CONFIG.headerTitle;
    if (hSub) hSub.innerText = PROJECT_CONFIG.headerSubtitle;

    renderLegend(null);

    const zaloBtn = document.getElementById('smart-zalo-btn');
    if (zaloBtn) {
        zaloBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const phoneNumber = PROJECT_CONFIG.zaloPhone;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
                window.location.href = "https://zalo.me/" + phoneNumber;
            } else {
                window.location.href = "zalo://conversation?phone=" + phoneNumber;
                setTimeout(function() {
                    window.open("https://zalo.me/" + phoneNumber, "_blank");
                }, 500);
            }
        });
    }
}

/**
 * HÀM TỰ ĐỘNG CHUẨN HÓA FILE SVG & LỒNG ẢNH NỀN
 */
function prepareSvgAndBackground(wrapper) {
    const svg = wrapper.querySelector('svg');
    if (!svg) return 1920;

    svg.setAttribute('id', 'map-svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    let vbX = 0, vbY = 0, vbW = 1920, vbH = 1080;
    const viewBoxAttr = svg.getAttribute('viewBox');
    if (viewBoxAttr) {
        const parts = viewBoxAttr.trim().split(/[\s,]+/).map(parseFloat);
        if (parts.length === 4 && !isNaN(parts[2]) && !isNaN(parts[3])) {
            [vbX, vbY, vbW, vbH] = parts;
        }
    } else {
        vbW = parseFloat(svg.getAttribute('width')) || 1920;
        vbH = parseFloat(svg.getAttribute('height')) || 1080;
        svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
    }

    if (PROJECT_CONFIG.bgImagePath) {
        let bgImg = svg.querySelector('image');
        if (!bgImg) {
            bgImg = document.createElementNS("http://www.w3.org/2000/svg", "image");
            const firstGroup = svg.querySelector('g, path, rect, polygon');
            if (firstGroup) {
                svg.insertBefore(bgImg, firstGroup);
            } else {
                svg.appendChild(bgImg);
            }
        }
        bgImg.setAttribute('href', PROJECT_CONFIG.bgImagePath);
        bgImg.setAttribute('x', vbX);
        bgImg.setAttribute('y', vbY);
        bgImg.setAttribute('width', vbW);
        bgImg.setAttribute('height', vbH);
        bgImg.setAttribute('preserveAspectRatio', 'none');
        bgImg.setAttribute('image-rendering', 'optimizeQuality');
    }

    return vbW;
}

/**
 * TÌM GIÁ TRỊ TRONG OBJECT LÔ ĐẤT THEO DANH SÁCH TÊN CỘT (KHÔNG PHÂN BIỆT HOA/THƯỜNG)
 */
function pickValue(info, keysList) {
    if (!info) return "";
    // 1. Khớp chính xác
    for (const k of keysList) {
        if (info[k] !== undefined && info[k] !== null && info[k] !== "" && info[k] !== "-") {
            return info[k];
        }
    }
    // 2. Khớp không phân biệt hoa/thường
    const infoKeys = Object.keys(info);
    for (const k of keysList) {
        const foundKey = infoKeys.find(ik => ik.trim().toLowerCase() === k.toLowerCase());
        if (foundKey && info[foundKey] !== undefined && info[foundKey] !== null && info[foundKey] !== "" && info[foundKey] !== "-") {
            return info[foundKey];
        }
    }
    return "";
}

function matchLandType(id, rawLoaiText) {
    const idUpper = (id || "").toUpperCase();
    const loaiLower = (rawLoaiText || "").toLowerCase();

    let matched = PROJECT_CONFIG.landTypes.find(t => t.prefix && idUpper.startsWith(t.prefix.toUpperCase()));
    if (matched) return matched;

    matched = PROJECT_CONFIG.landTypes.find(t => 
        t.keywords && t.keywords.some(k => loaiLower.includes(k.toLowerCase()))
    );
    return matched || null;
}

function matchSalesStatus(rawStatusText) {
    if (!rawStatusText) return null;
    const statusLower = rawStatusText.toString().trim().toLowerCase();
    return PROJECT_CONFIG.salesStatuses.find(s => 
        s.keywords && s.keywords.some(k => statusLower === k.toLowerCase() || statusLower.includes(k.toLowerCase()))
    ) || null;
}

/**
 * KIỂM TRA GIÁ TRỊ TRỐNG HOẶC BẰNG 0 (HỖ TRỢ SỐ THẬP PHÂN DẤU PHẨY VÀ DẤU CHẤM: 3,5 / 3.5)
 */
function isEmptyOrZero(val) {
    if (val === null || val === undefined) return true;
    const str = val.toString().trim();
    if (str === "" || str === "-") return true;

    const numStr = str.replace(/\s*(m2|m²|%|tầng|tang|tỷ|ty)\s*$/i, '').replace(/,/g, '.').trim();
    // Chỉ coi là bằng 0 nếu toàn bộ chuỗi là một con số và bằng 0 (VD: "0", "0.00", "0,0")
    if (/^[+-]?\d+(\.\d+)?$/.test(numStr) && parseFloat(numStr) === 0) {
        return true;
    }
    return false;
}

/**
 * CẬP NHẬT DÒNG THÔNG TIN TRONG POPUP & TỰ ĐỘNG ẨN NẾU TRỐNG / BẰNG 0
 */
function updateInfoRow(elementId, rawValue, defaultUnit = "", customLabel = null) {
    const el = document.getElementById(elementId);
    if (!el) return false;
    const row = el.closest('.info-row');

    if (isEmptyOrZero(rawValue)) {
        if (row) row.style.display = "none";
        return false;
    }

    // Đổi nhãn tiêu đề dòng nếu được yêu cầu (VD: đổi "Tầng 4:" thành "Tầng Tum:")
    if (customLabel && row) {
        const labelSpan = row.querySelector('span');
        if (labelSpan) labelSpan.innerText = customLabel;
    }

    let displayVal = rawValue.toString().trim();
    if (defaultUnit && !displayVal.toLowerCase().includes(defaultUnit.toLowerCase())) {
        const numericTest = displayVal.replace(/,/g, '.');
        if (!isNaN(Number(numericTest))) {
            displayVal = `${displayVal} ${defaultUnit}`;
        }
    }

    el.innerText = displayVal;
    if (row) row.style.display = "flex";
    return true;
}

/**
 * HÀM XỬ LÝ BẢN ĐỒ CHÍNH
 */
function initMap(svgViewBoxWidth) {
    const lotElements = document.querySelectorAll('svg g[id]');
    const lotMetrics = {};
    const dynamicFontSize = ((svgViewBoxWidth || 1920) / 1920) * 4;

    lotElements.forEach(lot => {
        const id = lot.id.trim();
        if (!dataBDS[id]) return;

        lot.classList.add('lot-interactive');
        const allShapes = lot.querySelectorAll('rect, polygon, path, polyline, line');
        if (allShapes.length === 0) return;

        const info = dataBDS[id];
        const rawLoai = pickValue(info, ["PhanLoai", "Loai", "MAUTK", "MauNha"]);
        const rawStatus = pickValue(info, ["TrangThai", "TINHTRANGKD", "TinhTrang"]);

        const landTypeObj = matchLandType(id, rawLoai);
        const statusObj = matchSalesStatus(rawStatus);

        if (landTypeObj && landTypeObj.autoFillSvg && landTypeObj.color) {
            allShapes.forEach(shape => { shape.style.fill = landTypeObj.color; });
        }

        if (statusObj && statusObj.mapColor) {
            allShapes.forEach(shape => {
                shape.style.fill = statusObj.mapColor; 
                shape.style.opacity = "0.85";  
            });
        }

        let bestAngle = 0;
        let maxEdgeWeight = 0;

        allShapes.forEach(shape => {
            let tagName = shape.tagName.toLowerCase();
            let intrinsicAngle = 0;
            let weight = 0;

            if (tagName === 'rect') {
                const w = parseFloat(shape.getAttribute('width') || 0);
                const h = parseFloat(shape.getAttribute('height') || 0);
                intrinsicAngle = (h > w) ? -90 : 0;
                weight = Math.max(w, h);
            } else {
                let points = [];
                if (tagName === 'line') {
                    points.push({x: parseFloat(shape.getAttribute('x1')), y: parseFloat(shape.getAttribute('y1'))});
                    points.push({x: parseFloat(shape.getAttribute('x2')), y: parseFloat(shape.getAttribute('y2'))});
                } else if (tagName === 'polygon' || tagName === 'polyline') {
                    const ptsStr = shape.getAttribute('points');
                    if (ptsStr) {
                        const coords = ptsStr.trim().split(/[\s,]+/).map(parseFloat);
                        for (let i = 0; i < coords.length; i += 2) {
                            if (!isNaN(coords[i]) && !isNaN(coords[i+1])) points.push({x: coords[i], y: coords[i+1]});
                        }
                        if (tagName === 'polygon' && points.length > 0) points.push(points[0]);
                    }
                } else if (tagName === 'path') {
                    const d = shape.getAttribute('d');
                    if (d) {
                        const coords = d.match(/[-+]?[0-9]*\.?[0-9]+/g);
                        if (coords) {
                            for (let i = 0; i < coords.length; i += 2) {
                                if (!isNaN(coords[i]) && !isNaN(coords[i+1])) points.push({x: parseFloat(coords[i]), y: parseFloat(coords[i+1])});
                            }
                        }
                    }
                }

                let maxLen = 0;
                for (let i = 0; i < points.length - 1; i++) {
                    let dx = points[i+1].x - points[i].x;
                    let dy = points[i+1].y - points[i].y;
                    let len = Math.sqrt(dx*dx + dy*dy);
                    if (len > maxLen) {
                        maxLen = len;
                        intrinsicAngle = Math.atan2(dy, dx) * (180 / Math.PI);
                    }
                }
                weight = maxLen;
            }

            let accRot = 0;
            let curr = shape;
            while (curr && curr !== lot.parentNode) {
                let tf = curr.getAttribute('transform');
                if (tf) {
                    let rMatch = tf.match(/rotate\(([-0-9.]+)/);
                    if (rMatch) accRot += parseFloat(rMatch[1]);
                    
                    let mMatch = tf.match(/matrix\(([^)]+)\)/);
                    if (mMatch) {
                        let vals = mMatch[1].split(/[\s,]+/).map(parseFloat);
                        if (vals.length >= 4) accRot += Math.atan2(vals[1], vals[0]) * (180 / Math.PI);
                    }
                }
                curr = curr.parentNode;
            }

            if (weight > maxEdgeWeight) {
                maxEdgeWeight = weight;
                bestAngle = intrinsicAngle + accRot;
            }
        });

        const bbox = lot.getBBox();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;

        const prefixMatch = id.match(/^([a-zA-Z0-9]+)-/);
        const prefix = prefixMatch ? prefixMatch[1] : "UNKNOWN";

        lotMetrics[id] = {
            element: lot,
            angle: bestAngle,
            finalAngle: bestAngle, 
            centerX: centerX,
            centerY: centerY,
            prefix: prefix
        };
    });

    const groups = {};
    for (let id in lotMetrics) {
        let p = lotMetrics[id].prefix;
        if (!groups[p]) groups[p] = [];
        groups[p].push(lotMetrics[id]);
    }

    for (let p in groups) {
        let siblings = groups[p];
        if (siblings.length < 2) continue;

        let angles = siblings.map(s => s.angle % 180);
        let bins = {};
        angles.forEach(a => {
            let bin = Math.round(a / 30) * 30;
            bins[bin] = (bins[bin] || 0) + 1;
        });
        let targetAngle = parseInt(Object.keys(bins).reduce((a, b) => bins[a] > bins[b] ? a : b));

        siblings.forEach(lot => {
            const info = dataBDS[lot.element.id];
            const gocXoay = pickValue(info, ["GocXoay"]);
            if (gocXoay !== "") {
                let manualAngle = parseFloat(gocXoay);
                if (!isNaN(manualAngle)) {
                    lot.finalAngle = manualAngle;
                    return; 
                }
            }

            let diff = Math.abs((lot.angle % 180) - targetAngle);
            if (diff > 90) diff = Math.abs(diff - 180);

            if (diff <= 25 || diff >= 65) {
                let final = lot.angle % 180;
                if (final > 90) final -= 180;
                if (final <= -90) final += 180;
                lot.finalAngle = final;
            } else {
                let final = targetAngle % 180;
                if (final > 90) final -= 180;
                if (final <= -90) final += 180;
                lot.finalAngle = final;
            }
        });
    }

    // VẼ NHÃN MÃ LÔ VÀ GẮN SỰ KIỆN CLICK POPUP
    for (let id in lotMetrics) {
        let lot = lotMetrics[id];
        const info = dataBDS[id];

        const textLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textLabel.setAttribute("x", lot.centerX);
        textLabel.setAttribute("y", lot.centerY);
        textLabel.setAttribute("text-anchor", "middle");
        textLabel.setAttribute("dominant-baseline", "central");
        textLabel.setAttribute("class", "lot-label");
        textLabel.style.fontSize = `${dynamicFontSize}px`;
        textLabel.setAttribute("transform", `rotate(${lot.finalAngle} ${lot.centerX} ${lot.centerY})`);
        textLabel.textContent = id; 
        lot.element.appendChild(textLabel);

        lot.element.addEventListener('click', function(e) {
            document.getElementById('malo').innerText = "Lô: " + id;
            
            // 1. Tình trạng bán hàng
            const statusEl = document.getElementById('trangThai');
            const trangThaiText = pickValue(info, ["TrangThai", "TINHTRANGKD", "TinhTrang"]) || "Đang cập nhật";
            const statusObj = matchSalesStatus(trangThaiText);

            statusEl.innerText = trangThaiText;
            statusEl.style.color = (statusObj && statusObj.textColor) ? statusObj.textColor : "#34495e";

            // 2. Loại đất / Mẫu thiết kế
            const rawLoai = pickValue(info, ["PhanLoai", "Loai", "MAUTK", "MauNha"]) || "-";
            const landTypeObj = matchLandType(id, rawLoai);
            let displayLoai = rawLoai;

            if (landTypeObj && landTypeObj.name) {
                if (rawLoai === "-" || rawLoai === "") {
                    displayLoai = landTypeObj.name;
                } else if (!rawLoai.toLowerCase().includes(landTypeObj.name.toLowerCase())) {
                    displayLoai = `${landTypeObj.name} (${rawLoai})`;
                }
            }
            document.getElementById('loai').innerText = displayLoai;

            // 3. Diện tích lô đất
            document.getElementById('dientich').innerText = pickValue(info, ["DienTichLo", "DT", "DienTich"]) || "-";
            
            // 4. Thông tin xây dựng & Các tầng (Hỗ trợ cả 3,5 tầng và 5 tầng)
            const constructInfo = document.getElementById('construction-info');
            const isDatNen = rawLoai.toLowerCase() === "đất nền";

            if (isDatNen) {
                constructInfo.style.display = "none";
            } else {
                const rawChieuCao = pickValue(info, ["ChieuCao", "TANGCAO", "SoTang", "CaoTang"]);
                const hasChieuCao = updateInfoRow('sotang', rawChieuCao, "tầng");
                const hasDtxd     = updateInfoRow('dtxd', pickValue(info, ["DienTichXD", "DTXD"]), "m2");
                const hasMatDo    = updateInfoRow('matdo', pickValue(info, ["MatDo", "MATDOXD"]), "%");

                // Kiểm tra xem có phải nhà 3,5 tầng (3 tầng 1 tum) không để đổi nhãn Tầng 4 nếu muốn
                const is35Tang = rawChieuCao && (/3[.,]5/.test(rawChieuCao.toString()) || rawChieuCao.toString().toLowerCase().includes("tum"));
                const labelTang4 = is35Tang ? "Tầng 4 (Tum):" : "Tầng 4:";

                const hasT1 = updateInfoRow('t1', pickValue(info, ["Tang1", "DTSANT1", "SanT1"]), "m2");
                const hasT2 = updateInfoRow('t2', pickValue(info, ["Tang2", "DTSANT2", "SanT2"]), "m2");
                const hasT3 = updateInfoRow('t3', pickValue(info, ["Tang3", "DTSANT3", "SanT3"]), "m2");
                const hasT4 = updateInfoRow('t4', pickValue(info, ["Tang4", "DTSANT4", "Tang4_Tum", "TangTum", "DTSANTUM", "SanT4"]), "m2", labelTang4);
                const hasT5 = updateInfoRow('t5', pickValue(info, ["Tang5", "DTSANT5", "SanT5", "Tang5_Tum"]), "m2");
                const hasTongSan = updateInfoRow('tongSan', pickValue(info, ["TongSanXD", "TONGSANXD", "TongSan"]), "m2");

                const floorDetails = document.getElementById('floor-details');
                const floorTitle = constructInfo.querySelector('.floor-title');
                const floorHr = constructInfo.querySelector('hr');
                const anyFloorVisible = hasT1 || hasT2 || hasT3 || hasT4 || hasT5 || hasTongSan;

                if (floorDetails) floorDetails.style.display = anyFloorVisible ? "block" : "none";
                if (floorTitle) floorTitle.style.display = anyFloorVisible ? "block" : "none";
                if (floorHr) floorHr.style.display = anyFloorVisible ? "block" : "none";

                constructInfo.style.display = (hasChieuCao || hasDtxd || hasMatDo || anyFloorVisible) ? "block" : "none";
            }

            infoBox.style.display = "block";
            if (window.innerWidth <= 768) {
                infoBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            e.stopPropagation(); 
        });
    }
}

document.addEventListener('click', function() { infoBox.style.display = "none"; });
infoBox.addEventListener('click', function(e) { e.stopPropagation(); });

function initZoom() {
    var eventsHandler = {
        haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
        init: function(options) {
            var instance = options.instance, initialScale = 1, pannedX = 0, pannedY = 0;
            this.hammer = new Hammer(options.svgElement, { 
                recognizers: [ [Hammer.Pan, {direction: Hammer.DIRECTION_ALL}], [Hammer.Pinch, {enable: true}] ] 
            });
            this.hammer.on('panstart panmove', function(ev){
                if (ev.type === 'panstart') { pannedX = 0; pannedY = 0; }
                instance.panBy({x: ev.deltaX - pannedX, y: ev.deltaY - pannedY});
                pannedX = ev.deltaX; pannedY = ev.deltaY;
            });
            this.hammer.on('pinchstart pinchmove', function(ev){
                if (ev.type === 'pinchstart') { initialScale = instance.getZoom(); }
                instance.zoomAtPoint(initialScale * ev.scale, {x: ev.center.x, y: ev.center.y});
            });
        },
        destroy: function(){ this.hammer.destroy(); }
    };

    svgPanZoom('#map-svg', {
        zoomEnabled: true,
        controlIconsEnabled: true, 
        fit: true,                 
        center: true,              
        minZoom: 0.5,
        maxZoom: 10,
        mouseWheelZoomEnabled: true, 
        preventMouseEventsDefault: false, 
        customEventsHandler: eventsHandler 
    });
}
