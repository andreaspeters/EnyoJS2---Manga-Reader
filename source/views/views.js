enyo.kind({
	name: "MyApps.MainView",
	kind: "Panels",
	classes: "enyo-unselectable enyo-fit",
	arrangerKind: "CollapsingArranger",
	authtoken: "",
	components:[
		{kind: "enyo.Panels", fit: true, arrangerKind: "CollapsingArranger", components: [
			{kind: "MyApps.MangaView", name:"productPanel", fit: true, realtimeFit: true},
			{name: "productsView"}
		]}
	]

});
