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
    url: "",
    locale: "id-ID",
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
      childOf: "Putra dari",
      father: { prefix: "Bapak", name: "H. Lukmanudin" },
      mother: { prefix: "Ibu", name: "Atik" },
      instagram: "",                         // e.g. "username" (without @). Empty = hidden.
      photo: {
        src: "assets/images/groom/groom",
        widths: [480, 800, 1200], w: 1365, h: 2048, color: "#6e7150",
        alt: "Potret Moh Agil Alghifari mengenakan busana berwarna taupe",
      },
    },
    bride: {
      fullName: "LAELI LUSPITASARI",
      displayName: "Laeli Luspitasari",
      nickname: "Laeli",
      initial: "L",
      childOf: "Putri dari",
      father: { prefix: "Bapak", name: "Misbah Hidayat" },
      mother: { prefix: "Ibu", name: "Iin Suryani" },
      instagram: "",
      photo: {
        src: "assets/images/bride/bride",
        widths: [480, 800, 1200], w: 1365, h: 2048, color: "#77855d",
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
   *  EVENTS
   *  NOTE: The brief lists BOTH events as "Akad Nikah" (08:30 and 10:00).
   *  This is preserved exactly. If the second one should be e.g. "Resepsi",
   *  change its `title` below.
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
      title: "Akad Nikah",
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
   *  Start = first event. The brief gives no end time ("selesai"), so the
   *  calendar entry ends at `end` below. Adjust if needed.
   * --------------------------------------------------------------------- */
  calendar: {
    title: "Wedding of Alghifari & Laeli",
    start: "2026-10-21T08:30:00+07:00",
    end: "2026-10-21T12:00:00+07:00",
    location: "SGB Learning Center, Jl. Desa Cilember, Megamendung, Cisarua, Kabupaten Bogor, Jawa Barat 16750",
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
      subtitle: "The Meeting",
      paragraphs: [
        "Tidak ada yang benar-benar terjadi secara kebetulan di dunia ini. Segalanya telah tersusun rapi oleh Sang Maha Kuasa, termasuk tentang kepada siapa hati ini akhirnya memilih untuk jatuh cinta.",
        "Hari itu, tanpa pernah kita duga sebelumnya, kita dipertemukan di tempat yang sama, dalam satu pekerjaan. Sebuah pertemuan sederhana yang saat itu mungkin terasa biasa saja, namun ternyata menjadi awal dari perjalanan panjang yang membawa kita sampai sejauh ini.",
      ],
      image: {
        src: "assets/images/story/story-01", widths: [480, 800, 1200], w: 2400, h: 3600, color: "#66552b",
        alt: "Alghifari dan Laeli terlihat di balik dedaunan di depan rumah joglo",
      },
    },
    {
      number: "02",
      title: "Pendekatan",
      subtitle: "The Courtship",
      paragraphs: [
        "Seiring berjalannya waktu, katanya cinta dapat tumbuh dari kebersamaan. Dari obrolan-obrolan kecil yang sederhana, perlahan tumbuh rasa nyaman yang membuat kami ingin saling mengenal lebih jauh.",
        "Hingga beberapa bulan kemudian, tanpa banyak rencana yang rumit, kami memutuskan untuk melangkah bersama dalam sebuah hubungan. Dari situlah, cerita kami perlahan dimulai.",
      ],
      image: {
        src: "assets/images/story/story-02", widths: [480, 800, 1200], w: 2400, h: 3600, color: "#8d7653",
        alt: "Alghifari dan Laeli saling memandang di beranda rumah joglo",
      },
    },
    {
      number: "03",
      title: "Lamaran",
      subtitle: "The Proposal",
      paragraphs: [
        "Perjalanan kami tentu bukan tanpa ujian dan cerita. Ada banyak hal yang harus kami lewati, ada jalan yang tidak selalu mudah, dan ada waktu-waktu yang mengajarkan kami tentang kesabaran.",
        "Namun, setiap proses yang kami lalui justru membuat kami semakin mengenal, memahami, dan menguatkan satu sama lain. Hingga pada akhirnya, kami semakin yakin bahwa perjalanan ini layak untuk diperjuangkan bersama.",
      ],
      image: {
        src: "assets/images/story/story-03", widths: [480, 800, 1200], w: 2400, h: 3600, color: "#44532f",
        alt: "Alghifari dan Laeli berdiri berdampingan di padang rumput",
      },
    },
    {
      number: "04",
      title: "Pernikahan",
      subtitle: "The Wedding",
      paragraphs: [
        "Kami percaya, bukan karena bertemu lalu berjodoh, tetapi karena berjodohlah Allah SWT mempertemukan kami dengan cara terbaik-Nya.",
        "Dengan rasa penuh syukur, kami memutuskan untuk mengikrarkan janji suci pernikahan pada tanggal 21 Oktober 2026.",
        "Kami mengerti, bukan semua jalan akan berjalan dengan mudah, dan tidak setiap doa dijawab secepat yang kita harapkan. Namun, di setiap jeda, kami belajar untuk percaya kepada Sang Maha Cinta, yang selalu tahu ke mana hati ini harus pulang.",
        "Hari ini, kami siap untuk melangkah lebih jauh, bersama.",
      ],
      image: {
        src: "assets/images/story/story-04", widths: [480, 800, 1200], w: 2400, h: 3600, color: "#856745",
        alt: "Alghifari dan Laeli berdiri berdampingan di depan pintu rumah joglo",
      },
    },
  ],

  /* --------------------------------------------------------------------- *
   *  GALLERY: "Our Moment"
   *  Order = display order. Add `wide: true` for landscape photos.
   * --------------------------------------------------------------------- */
  gallery: [
    { src: "assets/images/gallery/gallery-01", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#495b39", alt: "Alghifari dan Laeli berjalan bergandengan di antara bunga kosmos" },
    { src: "assets/images/gallery/gallery-02", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#8da57e", alt: "Alghifari dan Laeli tersenyum di tengah rerumputan hijau" },
    { src: "assets/images/gallery/gallery-03", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#71845a", alt: "Alghifari dan Laeli saling berhadapan menggenggam buket bunga" },
    { src: "assets/images/gallery/gallery-04", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#8d9b85", alt: "Laeli bersandar di bahu Alghifari di atas bangku kayu" },
    { src: "assets/images/gallery/gallery-05", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#777850", alt: "Alghifari dan Laeli berdiri di tepi aliran sungai berbatu" },
    { src: "assets/images/gallery/gallery-06", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#707247", alt: "Alghifari dan Laeli di atas jembatan kayu di tengah hutan" },
    { src: "assets/images/gallery/gallery-field", widths: [800, 1600], w: 2400, h: 1600, color: "#40502d", alt: "Alghifari dan Laeli berjalan di padang rumput di depan rumah beratap genteng", wide: true },
    { src: "assets/images/gallery/gallery-07", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#565a37", alt: "Alghifari dan Laeli berdiri di jembatan di bawah rimbun pakis" },
    { src: "assets/images/gallery/gallery-08", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#56612a", alt: "Alghifari dan Laeli melintasi jembatan kecil di tengah taman" },
    { src: "assets/images/gallery/gallery-09", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#8f8878", alt: "Alghifari dan Laeli berdiri di depan rumah putih bergaya kolonial" },
    { src: "assets/images/gallery/gallery-10", widths: [480, 800, 1600], w: 2400, h: 3600, color: "#918b7d", alt: "Alghifari dan Laeli melangkah bergandengan dari teras rumah putih" },
  ],

  /* --------------------------------------------------------------------- *
   *  WEDDING GIFT
   *  NOTE: Both accounts are currently identical, exactly as provided in
   *  the brief. Correct them here if needed.
   * --------------------------------------------------------------------- */
  gift: {
    intro:
      "Bagi Bapak/Ibu/Saudara/i yang ingin mengirimkan hadiah pernikahan dapat melalui transfer bank di bawah ini :",
    accounts: [
      { label: "Mempelai Pria", bank: "BCA", accountNumber: "7361529751", accountHolder: "MOH AGIL ALGHIFARI" },
      { label: "Mempelai Wanita", bank: "BCA", accountNumber: "7361529751", accountHolder: "MOH AGIL ALGHIFARI" },
    ],
  },

  /* --------------------------------------------------------------------- *
   *  RSVP & WEDDING WISHES (Google Apps Script backend)
   *  Paste your Web App URL (ends with /exec). See docs/GOOGLE-SHEETS.md.
   * --------------------------------------------------------------------- */
  rsvp: {
    apiUrl: "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",
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
