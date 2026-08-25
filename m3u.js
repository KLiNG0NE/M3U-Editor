/* ========================================================
    M3U PARSER & GENERATOR
    ======================================================== */
function parseM3U(text) {
    // Entferne BOM am Anfang falls vorhanden
    if(text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

    const lines = text.split(/\r?\n/).map(l => l.trim());
    const channels = [], epgUrls = [];
    let cur = null;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        if (line.startsWith('#EXTM3U')) {
            const re = /x-tvg-url\s*=\s*"([^"]*)"/g; let m;
            while ((m = re.exec(line)) !== null) { if (m[1] && !epgUrls.includes(m[1])) epgUrls.push(m[1]); }
            continue;
        }
        if (line.startsWith('#EXTINF:')) {
            cur = { id: genId(), name:'', url:'', radio:false, tvg:{id:'',name:'',logo:'',language:'',country:'',url:'',shift:'',chno:'',rec:'',guide:'',source:'',genre:''}, group:'' };
            const attrPart = line.substring(8);
            let commaIdx = -1, inQuotes = false;
            for (let j = 0; j < attrPart.length; j++) {
                const c = attrPart.charAt(j);
                if (c === '"') inQuotes = !inQuotes;
                else if (c === ',' && !inQuotes) { commaIdx = j; break; }
            }
            const attrString = commaIdx !== -1 ? attrPart.substring(0, commaIdx) : attrPart;
            if (commaIdx !== -1) cur.name = attrPart.substring(commaIdx + 1).trim();
            const re = /([\w][\w-]*)\s*=\s*"([^"]*)"/g; let m;
            while ((m = re.exec(attrString)) !== null) {
                const k=m[1], v=m[2];
                switch(k) {
                    case 'tvg-id': cur.tvg.id=v; break;
                    case 'tvg-name': cur.tvg.name=v; break;
                    case 'tvg-logo': cur.tvg.logo=v; break;
                    case 'tvg-language': cur.tvg.language=v; break;
                    case 'tvg-country': cur.tvg.country=v; break;
                    case 'tvg-url': cur.tvg.url=v; break;
                    case 'tvg-shift': cur.tvg.shift=v; break;
                    case 'tvg-chno': cur.tvg.chno=v; break;
                    case 'tvg-rec': cur.tvg.rec=v; break;
                    case 'tvg-guide': cur.tvg.guide=v; break;
                    case 'tvg-source': cur.tvg.source=v; break;
                    case 'tvg-genre': cur.tvg.genre=v; break;
                    case 'group-title': cur.group=v; break;
                    case 'radio': cur.radio=(v==='true'||v==='1'); break;
                }
            }
        } else if (!line.startsWith('#') && cur) { cur.url=line; channels.push(cur); cur=null; }
    }
    return { channels, epgUrls };
}

function generateM3U() {
    let header = '#EXTM3U';
    for (const url of state.epgUrls) header += ` x-tvg-url="${escAttr(url)}"`;
    let out = header + '\n';
    for (const ch of state.channels) {
        let a = '';
        // FIX: Einheitliche Attributreihenfolge (alphabetisch nach tvg-*)
        if (isRadio(ch)) a += ' radio="true"';
        if (ch.tvg.id) a += ` tvg-id="${escAttr(ch.tvg.id)}"`;
        if (ch.tvg.name) a += ` tvg-name="${escAttr(ch.tvg.name)}"`;
        if (ch.tvg.logo) a += ` tvg-logo="${escAttr(ch.tvg.logo)}"`;
        if (ch.tvg.language) a += ` tvg-language="${escAttr(ch.tvg.language)}"`;
        if (ch.tvg.country) a += ` tvg-country="${escAttr(ch.tvg.country)}"`;
        if (ch.tvg.chno !== '' && ch.tvg.chno !== undefined && !isNaN(parseFloat(ch.tvg.chno))) a += ` tvg-chno="${ch.tvg.chno}"`;
        if (ch.tvg.shift !== '' && ch.tvg.shift !== undefined && !isNaN(parseFloat(ch.tvg.shift))) a += ` tvg-shift="${ch.tvg.shift}"`;
        if (ch.tvg.genre) a += ` tvg-genre="${escAttr(ch.tvg.genre)}"`;
        if (ch.tvg.url) a += ` tvg-url="${escAttr(ch.tvg.url)}"`;
        if (ch.tvg.guide) a += ` tvg-guide="${escAttr(ch.tvg.guide)}"`;
        if (ch.tvg.source) a += ` tvg-source="${escAttr(ch.tvg.source)}"`;
        if (ch.tvg.rec) a += ` tvg-rec="${escAttr(ch.tvg.rec)}"`;
        if (ch.group) a += ` group-title="${escAttr(ch.group)}"`;
        out += `#EXTINF:-1${a},${escAttr(ch.name)}\n${ch.url}\n`;
    }
    return out;
}
