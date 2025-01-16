const defaultPage = {
  title: "Title",
  description: "Description",
  og: {
    image: "images/share/base.png",
    title: "title",
    description: "description",
  }
};

const phpOG = {
  og: {
    isPHP: true,
    title: "<?= $share->title ?>",
    description: "<?= $share->description ?>",
    canonical_url: "<?= $share->canonical_url ?>",
    fb_app_id: "",
    _image: "<?= $share->image ?>",
    image: {
      default: "<?= $share->image['fb'] ?>",
      vk: "<?= $share->image['vk'] ?>",
      tw: "<?= $share->image['tw'] ?>"
    }
  }
};

export {phpOG};

export default defaultPage;
