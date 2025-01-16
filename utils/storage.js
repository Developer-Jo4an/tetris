export default function storage(key, onUpdate){
  const {localStorage} = global;

  const update = (data) => {
    if (typeof onUpdate === "function") {
      onUpdate(data);
    }
  };

  return {
    save(data) {
      if (data) {
        localStorage?.setItem(key, JSON.stringify(data));
      } else {
        localStorage?.removeItem(key);
      }
      update(data);
    },
    load() {
      try {
        const info = JSON.parse(localStorage?.getItem(key));
        update(info);
        return info;
      } catch (e) {
        console.log(">>>");
      }

      return {};
    }
  }
}
