export default class MediaPreloader{
    constructor(list, onComplete){
        this.checkLoaded = this.checkLoaded.bind(this);
        this.loaded = 0;
        this.items = 0;
        this.onComplete = onComplete;

        list.forEach((item)=>{
            this.items += this.loadItem(item, "image");
            this.items += this.loadItem(item, "video");
            this.items += this.loadItem(item, "audio");
        });
    }

    checkLoaded(){
        const {items, onComplete} = this;
        this.loaded ++;
        if (this.loaded === items) onComplete();
    }

    loadItem(obj, type){
        if (!obj[type]) return 0;
        const el = document.createElement(type === "image" ? "img" : type === "video" ? "video" : "audio");
        el.onload = this.checkLoaded;
        el.onloadeddata = this.checkLoaded;
        el.src = obj[type];
        return 1;
    }
}