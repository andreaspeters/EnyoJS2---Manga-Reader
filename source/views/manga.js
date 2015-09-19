enyo.kind({
	name: "MyApps.MangaView",
	kind: "FittableRows",
	classes: "enyo-git",
	mainMenuPanelsCount: 0,
	config: {'server': "www.mangaeden.com", 'lastmanga': "", 'history': ""},
	menu: [],
	index: 0,
	imageCount: 0,
	page: 0,
	components:[
		{kind: "Panels", name: "mainMenuPanels", arrangerKind: "CardArranger",fit: true, style: "background: url(assets/bg.png);", components: [
			{kind:"FittableRows", components: [
				{kind: "enyo.List", name: "mangaList", fit: true, onSetupItem: "setupMangaList", touch: true, components: [	
					{class: "item", name: "item", components: [
						{kind: "Image", name: "mangaPreview", style: "width:100px"},
						{name: "mangaName"},
						{name: "mangaTags"}
					]},
					{name: "more", style: "background-color: #323232;", components: [
						{kind: "onyx.Button", content: "more", classes: "onyx-dark", style: "visibility:hidden", ontap: "moreMangas"}
					]}
				]}
			]},
			{kind:"FittableRows", components: [
				{name: "mangaContent", kind:"ImageCarousel", fit:true, lowMemory:true, onload:"showMangaChapter"},
				{kind: "FittableColumns", fit: true, name: "manga"},
				{name: "toolBar", kind: "onyx.Toolbar", components: [
					{name: "backButton", kind: 'onyx.Button', content:'BACK', allowHtml: true, ontap:'onBack'},
					{kind: "onyx.MenuDecorator", onSelect: "selectChapter", components: [
						{content: "Chapter"},
						{kind: "onyx.Menu", name: "mangaChapter"}
					]},
					{name: "prevButton", kind: 'onyx.Button', content:'&larr;', allowHtml: true, ontap:'previous'},
					{name: "nextButton", kind: 'onyx.Button', content:'&rarr;', allowHtml: true, ontap:'next'},
					{name: 'mangaIndex', content: "0"}
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
		this.$.nextButton.hide();
		this.$.prevButton.hide();
		this.$.mangaIndex.hide();
		this.chapterList = inResponse;
		this.$.manga.destroyComponents();
		this.$.manga.createComponents([
					{kind: "Image", sizing:"constrain", style: "width: 40%;", src: "http://cdn.mangaeden.com/mangasimg/"+this.chapterList.image},
					{kind: "FittableRows", components: [
						{name: "title", content: this.chapterList.title},
						{name: "description", content: this.chapterList.description},
						{name: "author", content: "Author: "+this.chapterList.author},
						{name: "tags", content: "Tags: "+this.chapterList.categories},
			
					]}
			], {owner: this.$.manga});
		this.$.manga.setStyle("height: 93%");
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

		// Aktuellen Manga Merken
		localStorage.setItem("lastmanga", this.config['lastmanga']);
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
		this.imageCount = x - 1;
		this.$.mangaContent.setImages([]);
		this.$.mangaContent.setImages(mangaImages);
		this.$.mangaContent.setIndex(0);
		this.$.nextButton.show();
		this.$.prevButton.show();
		this.$.mangaIndex.show();
		console.log( this.config['history']);
		localStorage.setItem("history", this.config['history']);
	},

	// Kapitel Auswaehlen
	selectChapter: function(inSender, inEvent) {
		this.$.manga.destroyComponents();
		this.$.manga.setStyle("height: 0px;");
		this.$.mangaContent.setStyle("height: 93%; background:url(assets/bg.png)");
		var length = this.chapterList.chapters.length;
		this.currentChapterIndex = 0;
		for (var i = 0; i < length; i++) {
			this.currentChapter = i;
			if (this.chapterList.chapters[i][0] == inEvent.selected.content) {
				i = length;
			}	
		} 
		this.jsonCall("/chapter/"+this.chapterList.chapters[this.currentChapter][3], enyo.bind(this,"successGetChapter"), enyo.bind(this, "errorML"));
		this.index = 0;
		this.$.mangaIndex.setContent(this.index);
	},


	// Uebersicht ueber alle Mangas
	setupMangaList: function(inSender, inEvent) {
		this.config['lastmanga'] = this.manga[inEvent.index].i;
		this.$.mangaName.setContent(this.manga[inEvent.index].t);
		this.$.mangaTags.setContent(this.manga[inEvent.index].c);
		if (this.manga[inEvent.index].im) {
			this.$.mangaPreview.setSrc("http://cdn.mangaeden.com/mangasimg/"+this.manga[inEvent.index].im);
		}
		if (inSender.isSelected(inEvent.index)) {	
			this.jsonCall("/manga/"+this.manga[inEvent.index].i, enyo.bind(this,"successGetChapterList"), enyo.bind(this, "errorML"));
			this.$.mainMenuPanels.setIndex(1);
		}
	},

	errorML: function(jqXHR, status, error) {
		alert("Error: "+error);
	},

	rendered: function() {
		this.jsonCall("/list/0/?p=0", enyo.bind(this,"successGetList"), enyo.bind(this,"errorML"));

		try {
            this.config['lastmanga'] = localStorage.getItem("lastmanga");
        } catch (e) {
        }

		if (this.config['lastmanga']) {
			this.jsonCall("/manga/"+this.config['lastmanga'], enyo.bind(this,"successGetChapterList"), enyo.bind(this, "errorML")    );
			this.$.mainMenuPanels.setIndex(1);
		}

	},

	previous: function(inSender, inEvent) {
		if (this.index > 0) {
			this.index--;
			this.$.mangaContent.previous();
			this.$.mangaContent.reflow();
			this.$.mangaIndex.setContent(this.index);
		}
	},

	next: function(inSender, inEvent) {
		if (this.index < this.imageCount) {
			this.index++;
			this.$.mangaContent.next();
			this.$.mangaContent.reflow();
			this.$.mangaIndex.setContent(this.index);
		}
	},

	onBack: function(inSender, inEvent) {
		this.$.mainMenuPanels.setIndex(0);
	},

	moreMangas: function() {
		this.page++;
		this.jsonCall("/list/0/?p="+this.page, enyo.bind(this,"successGetList"), enyo.bind(this,"errorML"));
	},


});
