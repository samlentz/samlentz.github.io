// Global state
let scheduleData = [];
let selectedArtists = new Set();
let sharedArtists = new Set();
let currentDay = 'all';
let currentStage = 'all';
let comparisonMode = false;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadScheduleData();
    loadUserSelections();
    checkForSharedSchedule();
    initializeEventListeners();
    renderSchedule();
    populateStageFilter();
});

// Load CSV data
async function loadScheduleData() {
    try {
        const response = await fetch('Austin_City_Limits_-_Weekend_One_Schedule.csv');
        const csvText = await response.text();
        scheduleData = parseCSV(csvText);
    } catch (error) {
        console.error('Error loading schedule:', error);
    }
}

// Parse CSV
function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Handle CSV parsing with quotes
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        if (values.length >= 5) {
            const obj = {
                stage: values[0],
                artist: values[1],
                startTime: values[2],
                endTime: values[3],
                date: values[4],
                day: values[4].split(',')[0] // Extract day name
            };
            data.push(obj);
        }
    }

    return data;
}

// Load user selections from localStorage
function loadUserSelections() {
    const saved = localStorage.getItem('aclSelections');
    if (saved) {
        selectedArtists = new Set(JSON.parse(saved));
    }
}

// Save user selections to localStorage
function saveUserSelections() {
    localStorage.setItem('aclSelections', JSON.stringify([...selectedArtists]));
}

// Check for shared schedule in URL
function checkForSharedSchedule() {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('schedule');
    const name = params.get('name');

    if (shared) {
        try {
            const decoded = atob(shared);
            sharedArtists = new Set(JSON.parse(decoded));
            comparisonMode = true;

            // Show comparison banner
            const banner = document.getElementById('comparison-banner');
            const friendName = document.getElementById('friend-name');
            banner.classList.remove('hidden');
            friendName.textContent = name || 'Your Friend';
        } catch (error) {
            console.error('Error decoding shared schedule:', error);
        }
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentDay = tab.dataset.day;
            renderSchedule();
        });
    });

    // Stage filter
    document.getElementById('stage-filter').addEventListener('change', (e) => {
        currentStage = e.target.value;
        renderSchedule();
    });

    // Share button
    document.getElementById('share-btn').addEventListener('click', showShareModal);

    // Create card button
    document.getElementById('create-card-btn').addEventListener('click', showCardModal);

    // Compare button
    document.getElementById('compare-btn').addEventListener('click', showComparisonModal);

    // Clear shared schedule
    document.getElementById('clear-share-btn').addEventListener('click', () => {
        window.history.pushState({}, '', window.location.pathname);
        sharedArtists.clear();
        comparisonMode = false;
        document.getElementById('comparison-banner').classList.add('hidden');
        renderSchedule();
    });

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Copy link button
    document.getElementById('copy-link-btn').addEventListener('click', copyShareLink);

    // Download card button
    document.getElementById('download-card-btn').addEventListener('click', downloadCards);

    // Card type change
    document.querySelectorAll('input[name="card-type"]').forEach(radio => {
        radio.addEventListener('change', updateCardPreview);
    });

    // Card style change
    document.querySelectorAll('input[name="card-style"]').forEach(radio => {
        radio.addEventListener('change', updateCardPreview);
    });

    // Card font change
    document.querySelectorAll('input[name="card-font"]').forEach(radio => {
        radio.addEventListener('change', updateCardPreview);
    });

    // Close modal on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModals();
            }
        });
    });
}

// Populate stage filter
function populateStageFilter() {
    const stages = [...new Set(scheduleData.map(item => item.stage))];
    const select = document.getElementById('stage-filter');
    
    stages.forEach(stage => {
        const option = document.createElement('option');
        option.value = stage;
        option.textContent = stage;
        select.appendChild(option);
    });
}

// Helper function to convert time to minutes for sorting
function timeToMinutes(timeStr) {
    if (!timeStr || timeStr === '—') return 9999;
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
}

// Render schedule
function renderSchedule() {
    const container = document.getElementById('schedule-container');
    container.innerHTML = '';

    // Filter data
    let filteredData = scheduleData;
    
    if (currentDay !== 'all') {
        filteredData = filteredData.filter(item => item.day === currentDay);
    }

    if (currentStage !== 'all') {
        filteredData = filteredData.filter(item => item.stage === currentStage);
    }

    // Group by day
    const days = currentDay === 'all' ? ['Friday', 'Saturday', 'Sunday'] : [currentDay];

    days.forEach(day => {
        const dayData = filteredData.filter(item => item.day === day);
        if (dayData.length === 0) return;

        // Sort by start time
        dayData.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

        const daySection = document.createElement('div');
        daySection.className = 'day-section';

        const dayHeader = document.createElement('h2');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        daySection.appendChild(dayHeader);

        const artistsList = document.createElement('div');
        artistsList.className = 'artists-list';

        dayData.forEach(item => {
            const card = createArtistCard(item);
            artistsList.appendChild(card);
        });

        daySection.appendChild(artistsList);
        container.appendChild(daySection);
    });

    if (filteredData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No artists found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
    }
}

// Create artist card
function createArtistCard(item) {
    const card = document.createElement('div');
    card.className = 'artist-card';

    const isSelected = selectedArtists.has(item.artist);
    const isFriendSelected = sharedArtists.has(item.artist);

    if (comparisonMode) {
        if (isSelected && isFriendSelected) {
            card.classList.add('both-selected');
        } else if (isSelected) {
            card.classList.add('selected');
        } else if (isFriendSelected) {
            card.classList.add('friend-selected');
        }
    } else if (isSelected) {
        card.classList.add('selected');
    }

    const artistInfo = document.createElement('div');
    artistInfo.className = 'artist-info';

    const details = document.createElement('div');
    details.className = 'artist-details';

    const name = document.createElement('div');
    name.className = 'artist-name';
    name.textContent = item.artist;

    const time = document.createElement('div');
    time.className = 'artist-time';
    time.textContent = `${item.startTime} - ${item.endTime}`;

    const stage = document.createElement('div');
    stage.className = 'artist-stage';
    stage.textContent = item.stage;

    details.appendChild(name);
    details.appendChild(time);
    details.appendChild(stage);

    const indicator = document.createElement('div');
    indicator.className = 'selection-indicator';

    artistInfo.appendChild(details);
    artistInfo.appendChild(indicator);

    card.appendChild(artistInfo);

    // Add comparison badge if in comparison mode
    if (comparisonMode && (isSelected || isFriendSelected)) {
        const badge = document.createElement('div');
        badge.className = 'comparison-badge';
        
        if (isSelected && isFriendSelected) {
            badge.className += ' badge-shared';
            badge.textContent = 'Both';
        } else if (isSelected) {
            badge.className += ' badge-yours';
            badge.textContent = 'You';
        } else {
            badge.className += ' badge-theirs';
            badge.textContent = 'Them';
        }
        
        card.appendChild(badge);
    }

    card.addEventListener('click', () => toggleArtist(item.artist));

    return card;
}

// Toggle artist selection
function toggleArtist(artist) {
    if (selectedArtists.has(artist)) {
        selectedArtists.delete(artist);
    } else {
        selectedArtists.add(artist);
    }
    saveUserSelections();
    renderSchedule();
}

// Show share modal
function showShareModal() {
    if (selectedArtists.size === 0) {
        alert('Please select at least one artist to share!');
        return;
    }

    const encoded = btoa(JSON.stringify([...selectedArtists]));
    const url = `${window.location.origin}${window.location.pathname}?schedule=${encoded}&name=${encodeURIComponent('My')}`;
    
    document.getElementById('share-link').value = url;
    document.getElementById('share-modal').classList.remove('hidden');
}

// Copy share link
function copyShareLink() {
    const input = document.getElementById('share-link');
    input.select();
    document.execCommand('copy');
    
    const btn = document.getElementById('copy-link-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.background = 'var(--success)';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 2000);
}

// Show card modal
function showCardModal() {
    if (selectedArtists.size === 0) {
        alert('Please select at least one artist to create a card!');
        return;
    }

    document.getElementById('card-modal').classList.remove('hidden');
    updateCardPreview();
}

// Update card preview
function updateCardPreview() {
    const cardType = document.querySelector('input[name="card-type"]:checked').value;
    const cardStyle = document.querySelector('input[name="card-style"]:checked').value;
    const cardFont = document.querySelector('input[name="card-font"]:checked').value;
    const preview = document.getElementById('card-preview');
    
    preview.innerHTML = '';

    if (cardType === 'three-cards') {
        ['Friday', 'Saturday', 'Sunday'].forEach(day => {
            const canvas = createCard(day, cardStyle, cardFont);
            if (canvas) preview.appendChild(canvas);
        });
    } else if (cardType === 'all-days') {
        const canvas = createCard('all', cardStyle, cardFont);
        if (canvas) preview.appendChild(canvas);
    } else {
        const day = cardType.charAt(0).toUpperCase() + cardType.slice(1);
        const canvas = createCard(day, cardStyle, cardFont);
        if (canvas) preview.appendChild(canvas);
    }
}

// Create card canvas
function createCard(day, style, font) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Instagram story dimensions (1080x1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // Get selected artists for this day
    let artists = [];
    if (day === 'all') {
        const allData = scheduleData.filter(item => selectedArtists.has(item.artist));
        allData.sort((a, b) => {
            const dayOrder = { Friday: 0, Saturday: 1, Sunday: 2 };
            if (dayOrder[a.day] !== dayOrder[b.day]) return dayOrder[a.day] - dayOrder[b.day];
            return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
        });
        artists = allData.map(item => ({
            name: item.artist,
            time: `${item.startTime}`,
            day: item.day.slice(0, 3).toUpperCase()
        }));
    } else {
        const dayData = scheduleData.filter(item => 
            item.day === day && selectedArtists.has(item.artist)
        );
        dayData.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
        artists = dayData.map(item => ({
            name: item.artist,
            time: `${item.startTime}`,
            stage: item.stage
        }));
    }

    if (artists.length === 0) return null;

    // Font configurations
    const fonts = {
        modern: {
            title: 'bold 120px "Bebas Neue", sans-serif',
            subtitle: 'bold 60px sans-serif',
            date: '42px sans-serif',
            artist: 'bold 48px sans-serif',
            time: '36px sans-serif'
        },
        retro: {
            title: 'bold 110px "Courier New", monospace',
            subtitle: 'bold 70px "Courier New", monospace',
            date: '40px "Courier New", monospace',
            artist: 'bold 46px "Courier New", monospace',
            time: '34px "Courier New", monospace'
        },
        elegant: {
            title: 'bold 100px Georgia, serif',
            subtitle: '60px Georgia, serif',
            date: 'italic 38px Georgia, serif',
            artist: '44px Georgia, serif',
            time: 'italic 32px Georgia, serif'
        }
    };

    const currentFonts = fonts[font];

    // Draw background based on style
    if (style === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
    } else if (style === 'dark') {
        ctx.fillStyle = '#1D3557';
    } else {
        ctx.fillStyle = '#F1FAEE';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative elements based on style
    if (style === 'gradient' && font === 'modern') {
        // Circular patterns
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(canvas.width / 2, 200, 100 + i * 50, 0, Math.PI * 2);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    } else if (style === 'dark' && font === 'retro') {
        // Dotted grid pattern
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#A8DADC';
        for (let x = 0; x < canvas.width; x += 40) {
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    } else if (style === 'classic' && font === 'elegant') {
        // Ornamental border
        ctx.strokeStyle = '#E63946';
        ctx.lineWidth = 8;
        ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
        ctx.lineWidth = 2;
        ctx.strokeRect(55, 55, canvas.width - 110, canvas.height - 110);
    }

    // Set text color based on style
    const textColor = (style === 'classic') ? '#1D3557' : '#FFFFFF';
    const accentColor = style === 'gradient' ? '#FFD700' : (style === 'dark' ? '#A8DADC' : '#E63946');

    // Draw header
    ctx.fillStyle = textColor;
    ctx.font = currentFonts.title;
    ctx.textAlign = 'center';
    
    // Title positioning based on font
    const titleY = font === 'retro' ? 200 : font === 'elegant' ? 220 : 180;
    ctx.fillText('AUSTIN CITY', canvas.width / 2, titleY);
    ctx.fillText('LIMITS', canvas.width / 2, titleY + (font === 'retro' ? 120 : font === 'elegant' ? 110 : 130));

    ctx.font = currentFonts.subtitle;
    const dayText = day === 'all' ? 'MY SCHEDULE' : day.toUpperCase();
    ctx.fillText(dayText, canvas.width / 2, titleY + (font === 'retro' ? 240 : font === 'elegant' ? 230 : 250));

    ctx.font = currentFonts.date;
    ctx.fillText('October 3-5, 2025', canvas.width / 2, titleY + (font === 'retro' ? 310 : font === 'elegant' ? 300 : 320));

    // Draw divider
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    const dividerY = titleY + (font === 'retro' ? 360 : font === 'elegant' ? 350 : 370);
    ctx.moveTo(100, dividerY);
    ctx.lineTo(980, dividerY);
    ctx.stroke();

    // Draw artists
    ctx.textAlign = 'left';
    ctx.font = currentFonts.artist;
    
    let y = dividerY + 80;
    const maxArtists = day === 'all' ? 20 : 25;
    const displayArtists = artists.slice(0, maxArtists);

    displayArtists.forEach((artist, index) => {
        // Draw decorative element
        if (font === 'modern') {
            ctx.beginPath();
            ctx.arc(130, y - 15, 10, 0, Math.PI * 2);
            ctx.fillStyle = accentColor;
            ctx.fill();
        } else if (font === 'retro') {
            ctx.fillStyle = accentColor;
            ctx.fillRect(110, y - 25, 15, 30);
        } else {
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(110, y - 10);
            ctx.lineTo(140, y - 10);
            ctx.stroke();
        }

        // Draw artist name
        ctx.fillStyle = textColor;
        ctx.fillText(artist.name, 170, y);

        // Draw time and day/stage
        ctx.font = currentFonts.time;
        ctx.globalAlpha = 0.8;
        const info = artist.day ? `${artist.day} • ${artist.time}` : `${artist.time} • ${artist.stage}`;
        ctx.fillText(info, 170, y + 40);
        ctx.globalAlpha = 1;
        ctx.font = currentFonts.artist;
        y += 85;

        if (y > canvas.height - 200) return;
    });

    if (artists.length > maxArtists) {
        ctx.font = currentFonts.time;
        ctx.fillStyle = textColor;
        ctx.globalAlpha = 0.8;
        ctx.fillText(`+ ${artists.length - maxArtists} more artists`, 170, y);
        ctx.globalAlpha = 1;
    }

    // Draw footer
    ctx.font = currentFonts.time;
    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.6;
    ctx.fillText('acl-schedule.com', canvas.width / 2, canvas.height - 80);
    ctx.globalAlpha = 1;

    return canvas;
}

// Download cards
function downloadCards() {
    const cardType = document.querySelector('input[name="card-type"]:checked').value;
    const cardStyle = document.querySelector('input[name="card-style"]:checked').value;
    const cardFont = document.querySelector('input[name="card-font"]:checked').value;

    if (cardType === 'three-cards') {
        ['Friday', 'Saturday', 'Sunday'].forEach(day => {
            downloadCard(day, cardStyle, cardFont);
        });
    } else if (cardType === 'all-days') {
        downloadCard('all', cardStyle, cardFont);
    } else {
        const day = cardType.charAt(0).toUpperCase() + cardType.slice(1);
        downloadCard(day, cardStyle, cardFont);
    }
}

// Download single card
function downloadCard(day, style, font) {
    const canvas = createCard(day, style, font);
    if (!canvas) return;

    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ACL-${day}-${style}-${font}-Story.png`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

// Show comparison modal
function showComparisonModal() {
    const shared = [...sharedArtists];
    const yours = [...selectedArtists];

    const sharedCount = shared.filter(a => yours.includes(a)).length;
    const yourUniqueCount = yours.filter(a => !shared.includes(a)).length;
    const theirUniqueCount = shared.filter(a => !yours.includes(a)).length;

    document.getElementById('shared-count').textContent = sharedCount;
    document.getElementById('your-unique-count').textContent = yourUniqueCount;
    document.getElementById('their-unique-count').textContent = theirUniqueCount;

    const details = document.getElementById('comparison-details');
    details.innerHTML = '';

    // Shared artists
    const sharedList = shared.filter(a => yours.includes(a));
    if (sharedList.length > 0) {
        const section = createComparisonSection('Artists You Both Selected', sharedList, 'success');
        details.appendChild(section);
    }

    // Your unique artists
    const yourUnique = yours.filter(a => !shared.includes(a));
    if (yourUnique.length > 0) {
        const section = createComparisonSection('Only You Selected', yourUnique, 'yours');
        details.appendChild(section);
    }

    // Their unique artists
    const theirUnique = shared.filter(a => !yours.includes(a));
    if (theirUnique.length > 0) {
        const section = createComparisonSection('Only They Selected', theirUnique, 'theirs');
        details.appendChild(section);
    }

    document.getElementById('comparison-modal').classList.remove('hidden');
}

// Create comparison section
function createComparisonSection(title, artists, type) {
    const section = document.createElement('div');
    section.className = 'comparison-section';

    const heading = document.createElement('h3');
    heading.textContent = `${title} (${artists.length})`;
    section.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'comparison-list';

    artists.forEach(artistName => {
        const item = scheduleData.find(a => a.artist === artistName);
        if (item) {
            const div = document.createElement('div');
            div.className = 'comparison-item';
            div.innerHTML = `
                <strong>${item.artist}</strong>
                <span class="time">${item.day} • ${item.startTime}</span>
            `;
            list.appendChild(div);
        }
    });

    section.appendChild(list);
    return section;
}

// Close all modals
function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
}
