enyo.kind({
	name: "MyApps.MangaView",
	kind: "FittableRows",
	mainMenuPanelsCount: 0,
	config: {'server': "www.mangaeden.com", 'lastmanga': "", 'lastchapter': ""},
	menu: [],
	components:[
		{kind: "Panels", name: "mainMenuPanels", arrangerKind: "CardArranger",fit: true, style: "background: url(assets/bg.jpg);", components: [
			{kind:"FittableRows", components: [
				{kind: "enyo.List", name: "mangaList", fit: true, onSetupItem: "setupMangaList", components: [	
					{class: "item", name: "item", components: [
						{kind: "Image", name: "mangaPreview", style: "width:100px"},
						{name: "mangaName"}
					]}
				]}
			]},
			{kind:"FittableRows", components: [
				{kind: "FittableColumns", name: "manga"},
				{name:"mangaContent", kind:"ImageCarousel", fit:true, onload:"showMangaChapter"},
				{kind: "onyx.Toolbar", style:"text-align:center;", components: [
					{kind: "onyx.MenuDecorator", onSelect: "selectChapter", components: [
						{content: "Chapter"},
						{kind: "onyx.Menu", name: "mangaChapter"}
					]}
				]}
			]}
		]}
	],

	jsonCall: function(method, responseFunction, errorFunction) {
		var ajax = new enyo.Ajax({
			url: "http://"+this.config['server']+"/api"+method,
    	});
    	ajax.go();
    
		ajax.response(responseFunction);
    	ajax.error(errorFunction);
	},

	// Alle Mangas Laden
	successGetList: function(inSender, inResponse) {
		this.manga = inResponse.manga;
		this.$.mangaList.setCount(this.manga.length);
		this.$.mangaList.render();
	},


	// Alle Kapitel eines Mangas Laden
	successGetChapterList: function(inSender, inResponse) {
		this.chapterList = inResponse;
		this.$.manga.destroyComponents();
		this.$.manga.createComponents([
					{kind: "Image", src: "http://cdn.mangaeden.com/mangasimg/"+this.chapterList.image},
					{kind: "FittableRows", components: [
						{name: "title", content: this.chapterList.title},
						{name: "description", content: this.chapterList.description}
					]}
			], {owner: this.$.manga});
		this.$.manga.setStyle("height: 90%");
		this.$.mangaContent.setStyle("height: 0px");
		this.$.manga.render();
		this.$.manga.reflow();
	
		// Loeschen der alten Menue Popup Menu Eintraege	
		var length = this.$.mangaChapter.getComponents().length;
		var compo  = this.$.mangaChapter.getComponents();
		for (var i = 1; i < length; i++) {
			compo[i].destroy();
		}

		// Neue Eintraege erstellen
		length = this.chapterList.chapters.length;
		for (var i=0; i < length; i++) {
			this.$.mangaChapter.createComponent([{content:this.chapterList.chapters[i][0]}], {owner: this.$.mangaChapter});
		}

		this.$.mangaChapter.render();
		this.$.mangaChapter.reflow();
	},

	// Den Inhalt eines Kapitels Laden
	successGetChapter: function(inSender, inResponse) {
		this.chapter = inResponse;
		var length = this.chapter.images.length-1;
		var mangaImages = [];
		var x = 0;
		for (var i=length; i >= 0; i--) {
			mangaImages[x] = "http://cdn.mangaeden.com/mangasimg/"+this.chapter.images[i][1];
			x++;
		}
		this.$.mangaContent.setImages(mangaImages)
	},

	// Kapitel Auswaehlen
	selectChapter: function(inSender, inEvent) {
		this.$.manga.destroyComponents();
		this.$.manga.setStyle("height: 0px;");
		this.$.mangaContent.setStyle("height: 90%; background:url(assets/bg.png)");
		var length = this.chapterList.chapters.length;
		this.currentChapterIndex = 0;
		for (var i = 0; i < length; i++) {
			this.currentChapter = i;
			if (this.chapterList.chapters[i][0] == inEvent.selected.content) {
				i = length;
			}	
		} 
		this.jsonCall("/chapter/"+this.chapterList.chapters[this.currentChapter][3], enyo.bind(this,"successGetChapter"), enyo.bind(this, "errorML"));
	},


	// Uebersicht ueber alle Mangas
	setupMangaList: function(inSender, inEvent) {
		this.$.mangaName.setContent(this.manga[inEvent.index].t);
		if (this.manga[inEvent.index].im) {
			this.$.mangaPreview.setSrc("http://cdn.mangaeden.com/mangasimg/"+this.manga[inEvent.index].im);
		}
		if (inSender.isSelected(inEvent.index)) {	
			this.jsonCall("/manga/"+this.manga[inEvent.index].i, enyo.bind(this,"successGetChapterList"), enyo.bind(this, "errorML"));
			this.$.mainMenuPanels.setIndex(1);

			// Aktuellen Manga Merken
			localStorage.setItem("lastmanga", this.manga[inEvent.index].i);
		}
	},

	errorML: function(jqXHR, status, error) {
		alert("Error: "+error);
	},

	rendered: function() {
		this.jsonCall("/list/0/", enyo.bind(this,"successGetList"), enyo.bind(this,"errorML"));

		try {
            this.config['lastmanga'] = localStorage.getItem("lastmanga");
        } catch (e) {
        }

		if (this.config['lastmanga']) {
			this.jsonCall("/manga/"+this.config['lastmanga'], enyo.bind(this,"successGetChapterList"), enyo.bind(this, "errorML")    );
			this.$.mainMenuPanels.setIndex(1);
		}

	},

});
