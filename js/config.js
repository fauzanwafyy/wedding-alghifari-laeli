/**
 * ============================================================================
 *  WEDDING CONFIGURATION: the ONE file to edit for wedding content.
 *  The Wedding of Alghifari & Laeli · 21 October 2026
 * ============================================================================
 *
 *  Edit the values below, save, commit and push. GitHub Pages redeploys
 *  automatically (about 1 minute). See docs/MAINTENANCE.md for step-by-step help.
 *
 *  Rules of thumb
 *  - Keep the quotes "..." around text. Use \n for a line break inside text.
 *  - Dates/times are ISO strings WITH the +07:00 (WIB) offset, e.g.
 *    "2026-10-21T08:30:00+07:00". This keeps the countdown correct for guests
 *    in any timezone.
 *  - The <head> of index.html (page title / WhatsApp preview text) is static.
 *    If you change the couple's names or the date, update it there too.
 * ============================================================================
 */

const WEDDING_CONFIG = {
  /* --------------------------------------------------------------------- *
   *  SITE
   * --------------------------------------------------------------------- */
  site: {
    // Public URL of the invitation (used in the calendar description and the
    // guest-link generator). Leave "" to auto-detect from the browser address.
    url: "https://fauzanwafyy.github.io/wedding-alghifari-laeli/",
    locale: "id-ID",
  },

  /* --------------------------------------------------------------------- *
   *  PAGE PHOTOS: cover, header and closing.
   *  All photos are listed in this file (couple portraits below, story and
   *  gallery further down). See docs/PHOTO-REPLACEMENT-GUIDE.md.
   *  `position` = which part of the photo stays visible when it is cropped
   *  ("50% 40%" = horizontally centred, slightly above the middle).
   * --------------------------------------------------------------------- */
  images: {
    // Opening cover (first screen) · source: awl-cover-3.jpg
    cover: {
      src: "assets/images/cover/cover-03", widths: [640, 960, 1440], w: 2400, h: 3600, color: "#66552b",
      position: "50% 50%", positionDesktop: "48% 60%",
      alt: "Alghifari dan Laeli berdiri berdampingan di beranda rumah joglo, terlihat di balik dedaunan",
    },
    // Header after opening (mobile) and the desktop side photo · source: awl-cover-1.jpg
    hero: {
      src: "assets/images/cover/cover-01", widths: [640, 960, 1440], w: 2400, h: 3600, color: "#997a57",
      position: "50% 32%", positionDesktop: "50% 72%",
      alt: "Alghifari dan Laeli berdiri di depan rumah joglo berukir kayu",
    },
    // Closing "Thank You" section · source: awl-cover-4.jpg
    closing: {
      src: "assets/images/cover/cover-04", widths: [640, 960, 1440], w: 2400, h: 3600, color: "#382708",
      position: "50% 40%",
      alt: "Alghifari dan Laeli diterangi cahaya lentera di malam hari",
    },
  },

  /* --------------------------------------------------------------------- *
   *  COUPLE & PARENTS
   * --------------------------------------------------------------------- */
  couple: {
    groom: {
      fullName: "MOH AGIL ALGHIFARI",        // official name (as provided)
      displayName: "Moh Agil Alghifari",     // how it is typeset on the page
      nickname: "Alghifari",                 // used in "Alghifari & Laeli"
      initial: "A",
      childOf: "Putra Pertama dari",
      father: { prefix: "Bapak", name: "H. Lukmanudin" },
      mother: { prefix: "Ibu", name: "Atik" },
      instagram: "",                         // e.g. "username" (without @). Empty = hidden.
      photo: {
        src: "assets/images/groom/groom",              // source: awl-groom.jpg
        widths: [480, 800, 1200], w: 1365, h: 2048, color: "#6e7150", position: "50% 22%",
        alt: "Potret Moh Agil Alghifari mengenakan busana berwarna taupe",
      },
    },
    bride: {
      fullName: "LAELI LUSPITASARI",
      displayName: "Laeli Luspitasari",
      nickname: "Laeli",
      initial: "L",
      childOf: "Putri Ketiga dari",
      father: { prefix: "Bapak", name: "Misbah Hidayat" },
      mother: { prefix: "Ibu", name: "Iin Suryani" },
      instagram: "",
      photo: {
        src: "assets/images/bride/bride",              // source: awl-bride.jpg
        widths: [480, 800, 1200], w: 1365, h: 2048, color: "#77855d", position: "50% 24%",
        alt: "Potret Laeli Luspitasari menggenggam buket bunga putih",
      },
    },
  },

  /* --------------------------------------------------------------------- *
   *  DATE & COUNTDOWN
   * --------------------------------------------------------------------- */
  wedding: {
    date: "2026-10-21",
    timezone: "Asia/Jakarta",
    timezoneLabel: "WIB",
    // The countdown counts down to this moment (first event start).
    countdownTarget: "2026-10-21T08:30:00+07:00",
    // After the countdown reaches zero the page shows the "today" message
    // until this moment, then the "after" message.
    celebrationEnds: "2026-10-22T00:00:00+07:00",
  },

  /* --------------------------------------------------------------------- *
   *  VENUE
   * --------------------------------------------------------------------- */
  venue: {
    name: "SGB Learning Center",
    // Address as listed on the Google Maps place for the link below.
    address: "Jl. Desa Cilember, Megamendung, Cilember, Kec. Cisarua, Kabupaten Bogor, Jawa Barat 16750",
    shortAddress: "Cilember, Cisarua, Kabupaten Bogor",
    mapsUrl: "https://maps.app.goo.gl/hkwfC3oZhdUQjaJB6",
  },

  /* --------------------------------------------------------------------- *
   *  EVENTS: one card per event.
   *  endTime: "HH:MM" or null.  endText: shown after the start time when
   *  endTime is null (e.g. "selesai" → "10.00 WIB – selesai").
   * --------------------------------------------------------------------- */
  events: [
    {
      title: "Akad Nikah",
      date: "2026-10-21",
      startTime: "08:30",
      endTime: null,
      endText: "",
      timezone: "Asia/Jakarta",
      venue: "SGB Learning Center",
      address: "Jl. Desa Cilember, Megamendung, Cilember, Kec. Cisarua, Kabupaten Bogor, Jawa Barat 16750",
      mapsUrl: "https://maps.app.goo.gl/hkwfC3oZhdUQjaJB6",
      note: "",
    },
    {
      title: "Resepsi",
      date: "2026-10-21",
      startTime: "10:00",
      endTime: null,
      endText: "selesai",
      timezone: "Asia/Jakarta",
      venue: "SGB Learning Center",
      address: "Jl. Desa Cilember, Megamendung, Cilember, Kec. Cisarua, Kabupaten Bogor, Jawa Barat 16750",
      mapsUrl: "https://maps.app.goo.gl/hkwfC3oZhdUQjaJB6",
      note: "",
    },
  ],

  /* --------------------------------------------------------------------- *
   *  SAVE THE DATE (Google Calendar)
   *  - The main "Save the Date" button saves the day, starting at the first
   *    event (Akad Nikah, 08.30 WIB).
   *  - Each event card has its own button (Akad Nikah 08.30, Resepsi 10.00).
   *  No end time is invented: when an event has no `endTime`, the calendar
   *  entry ends at the same moment it starts (Google Calendar needs an end
   *  value) and the description repeats the official "10.00 WIB – selesai".
   * --------------------------------------------------------------------- */
  calendar: {
    title: "The Wedding of Alghifari & Laeli",
    eventTitleSuffix: " · Alghifari & Laeli",   // per-event entries: "Resepsi · Alghifari & Laeli"
    location: "",                                // empty = venue.name + venue.address (above)
    description:
      "Dengan penuh rasa syukur, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu di hari pernikahan kami.",
  },

  /* --------------------------------------------------------------------- *
   *  OUR STORY: four chapters. Text is preserved from the brief.
   * --------------------------------------------------------------------- */
  story: [
    {
      number: "01",
      title: "Pertemuan",
      paragraphs: [
        "Tidak ada yang benar-benar terjadi secara kebetulan di dunia ini. Segalanya telah tersusun rapi oleh Sang Maha Kuasa, termasuk tentang kepada siapa hati ini akhirnya memilih untuk jatuh cinta.",
        "Hari itu, tanpa pernah kita duga sebelumnya, kita dipertemukan di tempat yang sama, dalam satu pekerjaan. Sebuah pertemuan sederhana yang saat itu mungkin terasa biasa saja, namun ternyata menjadi awal dari perjalanan panjang yang membawa kita sampai sejauh ini.",
      ],
      image: {
        src: "assets/images/story/story-01", widths: [480, 800, 1200], w: 2400, h: 3600, color: "#381f02", position: "50% 52%", // source: awl-cover-5.jpg
        alt: "Alghifari dan Laeli membawa lentera di tengah hutan pada malam hari",
      },
    },
    {
      number: "02",
      title: "Pendekatan",
      paragraphs: [
        "Seiring berjalannya waktu, katanya cinta dapat tumbuh dari kebersamaan. Dari obrolan-obrolan kecil yang sederhana, perlahan tumbuh rasa nyaman yang membuat kami ingin saling mengenal lebih jauh.",
        "Hingga beberapa bulan kemudian, tanpa banyak rencana yang rumit, kami memutuskan untuk melangkah bersama dalam sebuah hubungan. Dari situlah, cerita kami perlahan dimulai.",
      ],
      image: {
        src: "assets/images/story/story-02", widths: [480, 800, 1200], w: 2400, h: 3600, color: "#8d7653", position: "50% 55%", // source: awl-cover-2.jpg
        alt: "Alghifari dan Laeli saling memandang di beranda rumah joglo",
      },
    },
    {
      number: "03",
      title: "Lamaran",
      paragraphs: [
        "Perjalanan kami tentu bukan tanpa ujian dan cerita. Ada banyak hal yang harus kami lewati, ada jalan yang tidak selalu mudah, dan ada waktu-waktu yang mengajarkan kami tentang kesabaran.",
        "Namun, setiap proses yang kami lalui justru membuat kami semakin mengenal, memahami, dan menguatkan satu sama lain. Hingga pada akhirnya, kami semakin yakin bahwa perjalanan ini layak untuk diperjuangkan bersama.",
      ],
      image: {
        src: "assets/images/story/story-03", widths: [480, 800, 1200], w: 2400, h: 3600, color: "#44532f", position: "50% 62%", // source: awl-cover-6.jpg
        alt: "Alghifari dan Laeli berdiri berdampingan di padang rumput",
      },
    },
    {
      number: "04",
      title: "Pernikahan",
      paragraphs: [
        "Kami percaya, bukan karena bertemu lalu berjodoh, tetapi karena berjodohlah Allah SWT mempertemukan kami dengan cara terbaik-Nya.",
        "Dengan rasa penuh syukur, kami memutuskan untuk mengikrarkan janji suci pernikahan pada tanggal 21 Oktober 2026.",
        "Kami mengerti, bukan semua jalan akan berjalan dengan mudah, dan tidak setiap doa dijawab secepat yang kita harapkan. Namun, di setiap jeda, kami belajar untuk percaya kepada Sang Maha Cinta, yang selalu tahu ke mana hati ini harus pulang.",
        "Hari ini, kami siap untuk melangkah lebih jauh, bersama.",
      ],
      image: {
        src: "assets/images/story/story-04", widths: [480, 800, 1200], w: 2400, h: 3600, color: "#856745", position: "50% 58%", // source: awl-cover-8.jpg
        alt: "Alghifari dan Laeli berdiri berdampingan di depan pintu rumah joglo",
      },
    },
  ],

  /* --------------------------------------------------------------------- *
   *  GALLERY: "Our Moment"
   *  Order = display order. Add `wide: true` for landscape photos.
   *  gallery-01 … gallery-10 = awl-gallery-01 … 10.jpg · gallery-11 = awl-cover-7.jpg
   *  `galleryBackdrop` (below) = the very soft blurred photo behind the gallery.
   * --------------------------------------------------------------------- */
  galleryBackdrop: "assets/images/gallery/gallery-backdrop.webp",
  gallery: [
    { src: "assets/images/gallery/gallery-01", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#495b39", alt: "Alghifari dan Laeli berjalan bergandengan di antara bunga kosmos" },
    { src: "assets/images/gallery/gallery-02", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#8da57e", alt: "Alghifari dan Laeli tersenyum di tengah rerumputan hijau" },
    { src: "assets/images/gallery/gallery-03", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#71845a", alt: "Alghifari dan Laeli saling berhadapan menggenggam buket bunga" },
    { src: "assets/images/gallery/gallery-04", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#8d9b85", alt: "Laeli bersandar di bahu Alghifari di atas bangku kayu" },
    { src: "assets/images/gallery/gallery-05", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#777850", alt: "Alghifari dan Laeli berdiri di tepi aliran sungai berbatu" },
    { src: "assets/images/gallery/gallery-06", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#707247", alt: "Alghifari dan Laeli di atas jembatan kayu di tengah hutan" },
    { src: "assets/images/gallery/gallery-11", widths: [800, 1600], w: 2400, h: 1600, color: "#40502d", alt: "Alghifari dan Laeli berjalan di padang rumput di depan rumah beratap genteng", wide: true },
    { src: "assets/images/gallery/gallery-07", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#565a37", alt: "Alghifari dan Laeli berdiri di jembatan di bawah rimbun pakis" },
    { src: "assets/images/gallery/gallery-08", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#56612a", alt: "Alghifari dan Laeli melintasi jembatan kecil di tengah taman" },
    { src: "assets/images/gallery/gallery-09", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#8f8878", alt: "Alghifari dan Laeli berdiri di depan rumah putih bergaya kolonial" },
    { src: "assets/images/gallery/gallery-10", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#918b7d", alt: "Alghifari dan Laeli melangkah bergandengan dari teras rumah putih" },
  ],

  /* --------------------------------------------------------------------- *
   *  WEDDING GIFT
   *  accountNumber: digits only (spaces are added automatically on screen).
   * --------------------------------------------------------------------- */
  gift: {
    intro:
      "Bagi Bapak/Ibu/Saudara/i yang ingin mengirimkan hadiah pernikahan dapat melalui transfer bank di bawah ini :",
    accounts: [
      { label: "The Groom", bank: "BCA", accountNumber: "7361529751", accountHolder: "MOH AGIL ALGHIFARI" },
      { label: "The Bride", bank: "BCA", accountNumber: "7361504589", accountHolder: "LAELI LUSPITA SARI" },
    ],
  },

  /* --------------------------------------------------------------------- *
   *  RSVP & WEDDING WISHES (Google Apps Script backend)
   *  Paste your Web App URL (ends with /exec). See docs/GOOGLE-SHEETS.md.
   * --------------------------------------------------------------------- */
  rsvp: {
    apiUrl: "https://script.google.com/macros/s/AKfycbxAJ-qHfMK--DcGSp1C_9E1wrarz_hrWl2teccNZPfjWnxheVE5KCtGyzRTmHYj-7gm/exec",
    closed: false,                // true = stop accepting RSVPs (wishes stay visible)
    maxGuests: 5,                 // max people per RSVP (including the guest)
    nameMaxLength: 80,
    messageMaxLength: 500,
    requestTimeoutMs: 15000,
    wishesPollIntervalMs: 30000,  // refresh wishes every 30 s while visible
    wishesPageSize: 8,            // wishes shown before "show more"
  },

  /* --------------------------------------------------------------------- *
   *  MUSIC
   * --------------------------------------------------------------------- */
  music: {
    enabled: true,
    src: "assets/audio/wedding-song.mp3",
    title: "Masa Ini, Nanti, dan Masa Indah Lainnya · Nuca",
    volume: 0.7,
  },

  /* --------------------------------------------------------------------- *
   *  COPY: editable sentences used around the page
   * --------------------------------------------------------------------- */
  copy: {
    coverTo: "Kepada Yth. Bapak/Ibu/Saudara/i",
    coverDefaultGuest: "Tamu Undangan",
    coverNote: "Mohon maaf apabila ada kesalahan penulisan nama dan gelar.",
    openButton: "Buka Undangan",

    salam: "Assalamu’alaikum Warahmatullahi Wabarakatuh",
    intro:
      "Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu di hari pernikahan kami.",

    verse: {
      enabled: true,
      text: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.",
      source: "QS. Ar-Rum : 21",
    },

    coupleIntro:
      "Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Atas rahmat dan ridho-Nya, kami dipersatukan dalam ikatan pernikahan.",

    countdownLabels: { days: "Hari", hours: "Jam", minutes: "Menit", seconds: "Detik" },
    countdownToday: "Today is the day.",
    countdownTodaySub: "Hari bahagia itu telah tiba. Terima kasih telah menjadi bagian darinya.",
    countdownAfter: "Alhamdulillah.",
    countdownAfterSub: "Kami telah resmi menjadi suami dan istri. Terima kasih atas doa dan restunya.",

    storyIntro: "Sebuah perjalanan sederhana, dari pertemuan yang tak direncanakan hingga janji yang kami ikrarkan.",
    galleryIntro: "Potongan waktu yang ingin kami simpan dan bagikan bersama Anda.",

    rsvpIntro:
      "Kehadiran dan doa restu Anda adalah hadiah terindah bagi kami. Mohon konfirmasi kehadiran melalui formulir berikut.",
    rsvpDeadline: "",            // e.g. "Mohon konfirmasi sebelum 14 Oktober 2026." Empty = hidden.
    rsvpClosed: "Konfirmasi kehadiran telah ditutup. Terima kasih atas doa dan perhatiannya.",

    wishesIntro: "Untaian doa dan ucapan dari keluarga, sahabat, dan orang-orang terkasih.",

    closing:
      "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kami.",
    closingSalam: "Wassalamu’alaikum Warahmatullahi Wabarakatuh",
    closingSignature: "Kami yang berbahagia",
    familyPrefix: "Keluarga Besar",
  },
};

/* ============================================================================
 *  GUEST LIST (optional)
 *
 *  Two ways to personalise a link. Both work at the same time:
 *
 *  1) Free text, no setup needed:
 *       https://…/?to=Pujo                 → "Pujo"
 *       https://…/?to=Pujo+%26+Partner     → "Pujo & Partner"
 *
 *  2) Short slug from this list:
 *       https://…/?to=fauzan-wafi          → "Fauzan Wafi & Partner"
 *
 *  Keys must be lowercase-with-dashes. `partner` can be "Partner",
 *  "Keluarga", a real name, or "" for none. Use generator.html to create links.
 *  NOTE: this file is public, so only add what you're happy to be visible.
 * ========================================================================== */
const GUESTS = {
  "fauzan-wafi": { name: "Fauzan Wafi", partner: "Partner" },
  "ade-fitriyani": { name: "Ade Fitriyani", partner: "" },
};

// Make the configuration available to the other scripts.
window.WEDDING_CONFIG = WEDDING_CONFIG;
window.GUESTS = GUESTS;
