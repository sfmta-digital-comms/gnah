<script>
    setTimeout(function () {
        const pages = [
            {
                "title": "Automotive Service Worker",
                "name": "Meet Nicole Humphrey",
                "type": "page",
                "url": "https://www.sfmta.com/sfmta-career-center/women-in-the-trades-sfmta/automotive-service-worker",
                "img": "https://www.sfmta.com/sites/default/files/teaser-images/2024/03/automotive_service_worker_nicolehumphrey_headerimage.jpg",
                "section-name": "Women in the Trades at Muni",
                "section-url": "https://www.sfmta.com/blog/celebrate-women-trades-muni-and-learn-how-work-their-fields"
            },
            {
                "title": "Contract Manager",
                "name": " Meet Katherine Kwok",
                "type": "page",
                "url": "https://www.sfmta.com/sfmta-career-center/women-in-the-trades-sfmta/contract-manager",
                "img": "https://www.sfmta.com/sites/default/files/teaser-images/2024/03/analyst_kat_kwok_header_image.jpg",
                "section-name": "Women in the Trades at Muni",
                "section-url": "https://www.sfmta.com/blog/celebrate-women-trades-muni-and-learn-how-work-their-fields"
            },
            {
                "title": "Engineer / Project Manager",
                "name": "Meet Becky Chen",
                "type": "page",
                "url": "https://www.sfmta.com/sfmta-career-center/women-in-the-trades-sfmta/engineer-project-manager",
                "img": "https://www.sfmta.com/sites/default/files/teaser-images/2024/03/engineer-project-manager-becky-chen-header.jpg",
                "section-name": "Women in the Trades at Muni",
                "section-url": "https://www.sfmta.com/blog/celebrate-women-trades-muni-and-learn-how-work-their-fields"
            },
            {
                "title": "Machinist Apprentice",
                "name": "Meet Brittany McMartin",
                "type": "page",
                "url": "https://www.sfmta.com/sfmta-career-center/women-in-the-trades-sfmta/maintenance-machinist-apprentice",
                "img": "https://www.sfmta.com/sites/default/files/teaser-images/2024/03/apprenticemachinist_brittanymcmartin_headerimage.jpg",
                "section-name": "Women in the Trades at Muni",
                "section-url": "https://www.sfmta.com/blog/celebrate-women-trades-muni-and-learn-how-work-their-fields"
            },
            {
                "title": "Mechanic",
                "name": "Meet Jeena Villamor",
                "type": "page",
                "url": "https://www.sfmta.com/sfmta-career-center/women-in-the-trades-sfmta/mechanic-buses",
                "img": "https://www.sfmta.com/sites/default/files/teaser-images/2024/03/mechanic_jeena_villamor_header_image_0.jpg",
                "section-name": "Women in the Trades at Muni",
                "section-url": "https://www.sfmta.com/blog/celebrate-women-trades-muni-and-learn-how-work-their-fields"
            },
            {
                "title": "Mechanic",
                "name": "Meet Jenny Keosaat",
                "type": "page",
                "url": "https://www.sfmta.com/sfmta-career-center/women-in-the-trades-sfmta/mechanic-historic-streetcars",
                "img": "https://www.sfmta.com/sites/default/files/teaser-images/2024/03/mechanic_jenny_keosaat_header_image.jpg",
                "section-name": "Women in the Trades at Muni",
                "section-url": "https://www.sfmta.com/blog/celebrate-women-trades-muni-and-learn-how-work-their-fields"
            },
            {
                "title": "Parts Storekeeper",
                "name": "Meet Evelyn Cotton",
                "type": "page",
                "url": "https://www.sfmta.com/sfmta-career-center/women-in-the-trades-sfmta/parts-storekeeper",
                "img": "https://www.sfmta.com/sites/default/files/teaser-images/2024/03/partsstorekeeper_evelyn_cotton_header_image.jpg",
                "section-name": "Women in the Trades at Muni",
                "section-url": "https://www.sfmta.com/blog/celebrate-women-trades-muni-and-learn-how-work-their-fields"
            },
            {
                "title": "Parts Storekeeper Supervisor",
                "name": "Meet Deneitra Henry",
                "type": "page",
                "url": "https://www.sfmta.com/sfmta-career-center/women-in-the-trades-sfmta/parts-storekeeper-supervisor",
                "img": "https://www.sfmta.com/sites/default/files/teaser-images/2024/03/partsstorekeepersupervisor_deneitrahenry_headerimage.jpg",
                "section-name": "Women in the Trades at Muni",
                "section-url": "https://www.sfmta.com/blog/celebrate-women-trades-muni-and-learn-how-work-their-fields"
            },
            {
                "title": "Power System Operator",
                "name": "Meet ess Goldworthy",
                "type": "page",
                "url": "https://www.sfmta.com/sfmta-career-center/women-in-the-trades-sfmta/power-system-operator",
                "img": "https://www.sfmta.com/sites/default/files/teaser-images/2024/03/powersystemoperator_essgoldworthy_headerimage.jpg",
                "section-name": "Women in the Trades at Muni",
                "section-url": "https://www.sfmta.com/blog/celebrate-women-trades-muni-and-learn-how-work-their-fields"
            },
            {
                "title": "Transit Car Cleaner",
                "name": "Meet Trina Dixon",
                "type": "page",
                "url": "https://www.sfmta.com/sfmta-career-center/women-in-the-trades-sfmta/transit-car-cleaner",
                "img": "https://www.sfmta.com/sites/default/files/teaser-images/2024/03/transitcarcleaner_trina_dixon_-_header_image.jpg",
                "section-name": "Women in the Trades at Muni",
                "section-url": "https://www.sfmta.com/blog/celebrate-women-trades-muni-and-learn-how-work-their-fields"
            }
        ]

        const parentElement = document.getElementById('placeholder').parentElement;

        let newContent = `
            <div class="view view-section-1-revision- view-id-section_1_revision_ view-display-id-block teaser-grid view-dom-id-50e4f637ad6ac208eb6f6b3ab50f551b">
                <div class="view-content">
                    <div id="views-bootstrap-grid-1" class="views-bootstrap-grid-plugin-style">
                        <div class="row">`;

        pages.forEach(page => {
            newContent += `
                <div class="col col-sm-6 col-md-6 col-lg-6">
                    <div class="col-content" style="overflow: hidden; height: 275px;">
                        <div class="views-field views-field-nothing">
                            <span class="field-content">
                                <a href="${page.url}" class="teaser-text" title="${page.title}">
                                    <img class="teaser-col-4 img-responsive" src="${page.img}" style="width: 100%; height: 200px; object-fit: cover;" alt="${page.title}: ${page.name}">
                                    <span class="text-content">
                                        <span class="title">${page.title}</span>
                                        <span class="teaser-byline">${page.name}</span>
                                    </span>
                                </a>
                            </span>
                        </div>
                    </div>
                </div>`;
        });

        // Append the YouTube embed iframe to newContent
        newContent += `
                        </div>
                    </div>
                </div>
            </div>
            <!-- Embed YouTube video below the content -->
            <div style="text-align: center; margin-top: 20px; position: relative; width: 100%; padding-top: 56.25%; overflow: hidden;">
                <iframe src="https://www.youtube.com/embed/V1mkB6w3WQc?si=NLfgyUPyzcaZ1yW3" title="YouTube video player" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>
            <br />
            <p><em>Editor's note: We want to thank our Transit Division for their partnership on this story. Michael Henry, acting chief mechanical officer for Fleet Maintenance, encouraged us to share the stories of women in the trades.</em></p>`;

        parentElement.innerHTML = newContent;
    }, 500);
</script>