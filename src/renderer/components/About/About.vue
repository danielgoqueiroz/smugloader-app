<template>
  <b-container class="info">
    <b-row justify-content-md-center>
      <b-col md="2">
        <img
          id="about"
          v-bind="mainProps"
          src="~@/assets/about.jpg"
          rounded="circle"
          alt="Daniel Queiroz"
        />
      </b-col>
      <b-col>
        <b-card title="Sobre" sub-title="Daniel Gomes Queiroz">
          <b-card-text>
            A ideia do Smugloader foi uma das motivações para iniciar a aprender
            sobre programação e surgiu da necessidade baixar de forma fácil
            imagens do Smugmug. Inicialmente feito em java, passei a ideia para
            duas tecnologias estava estudando, VueJs e Electron.
          </b-card-text>
          <b-link
            v-for="link in links"
            :key="link.type"
            :href="link.link"
            target="_blank"
            class="card-link"
            variant="info"
            :title="link.alt"
          >
            <i :class="link.type" aria-hidden="true"></i>
          </b-link>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      links: [
        {
          type: "fa fa-external-link",
          link: "http://danielqueiroz.com",
          alt: "site",
        },
        {
          type: "fa fa-linkedin-square",
          link: "https://www.linkedin.com/in/danielgqueiroz/",
          alt: "linkedin",
        },
        {
          type: "fa fa-instagram",
          link: "https://www.instagram.com/danielgoqueiroz/",
          alt: "instagram",
        },
        {
          type: "fa fa-github-square",
          link: "https://github.com/danielgoqueiroz/smugloader-app",
          alt: "Github",
        },
      ],
      mainProps: {
        width: 100,
        height: 100,
        class: "m1",
      },
    };
  },
  methods: {
    open(link) {
      window.open(
        link,
        "_blank",
        "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=1024,height=800"
      );
    },
  },
};
</script>

<style>
.info {
  padding: 20px;
}

.footer {
  padding: 20px;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  color: white;
  text-align: center;
}
</style>
