<template>
  <div class="cols">
    <div id="modules-tree">
      <ul class='circle-container'>
        <li v-for="item in links">
          <button @click="navigateToLink(item)" :class="defineClass(item)" :id="item.id">
            {{ item.title }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        links: [
          {
            title: 'BI Агро',
            link: '/biagro',
            id: '',
            active: false,
          },
          {
            title: 'Agroinfo',
            link: '/agroinfo',
            id: '',
            active: false,
          },
          {
            title: 'Баланс зерна',
            link: '/balanszerna',
            id: '',
            active: true,
          },
          {
            title: 'Agrostock',
            link: '/agrostock',
            id: '',
            active: false,
          },
          {
            title: 'Admin',
            link: '/admin',
            id: '',
            active: false,
          },
          {
            title: 'Agroplan',
            link: '/agroplan',
            id: '',
            active: true,
          },
          {
            title: 'Agromap',
            link: '/agromap',
            id: '',
            active: true,
          },
          {
            title: 'Agrofact',
            link: '/agrofact',
            id: '',
            active: true,
          },
          {
            title: '',
            link: '/',
            id: 'logo',
            active: false,
          },
        ]
      }
    },
    methods: {
      navigateToLink(obj) {
        if (obj.active) {
          let link = obj.link.replace('/', '');
          this.$root.setModule(link);
          this.$router.push(obj.link);
        }
      },
      defineClass(obj) {
        if (!obj.active) {
          return 'circles not-active-circle';
        } else {
          return 'circles active-circle';
        }
      },
      defineLink(obj) {
        if (!obj.active) {
          return '/';
        } else {
          return obj.link;
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .cols {
    overflow: auto;
    justify-content: center;
  }
  .workspace {
    background: #fff;
  }
  button {
    border: 0;
    font-size: 1em;
  }
  button:focus {
    outline: 0;
  }
  /// Mixin to place items on a circle
  /// @author Hugo Giraudel
  /// @author Ana Tudor
  /// @param {Integer} $item-count - Number of items on the circle
  /// @param {Length} $circle-size - Large circle size
  /// @param {Length} $item-size - Single item size
  @mixin on-circle($item-count, $circle-size, $item-size) {
    position: relative;
    width:  $circle-size;
    height: $circle-size;
    padding: 0;
    border-radius: 50%;
    list-style: none;

    > * {
      display: block;
      position: absolute;
      top:  50%;
      left: 50%;
      width:  $item-size;
      height: $item-size;
      margin: -($item-size / 2);

      $angle: (360 / $item-count);
      $rot: 0;

      @for $i from 1 through $item-count {
        &:nth-of-type(#{$i}) {
          transform:
            rotate($rot * 1deg)
            translate($circle-size / 2)
            rotate($rot * -1deg);
        }

        $rot: $rot + $angle;
      }
    }
  }

  .circle-container {
    $background-color: rgba(178, 34, 34, 1);
    $background-color-light: rgb(255, 46, 46);
    $text-color: rgba(255, 255, 255, 0.9);
    $not-active-color: rgba(86, 86, 88, 1);
    $not-active-color-light: rgb(133, 133, 136);

    $logo-proportion: 2.747482014;
    $logo-width: 300px;
    $logo-height: $logo-width / $logo-proportion;

    @include on-circle($item-count: 8, $circle-size: 32em, $item-size: 9em);
    margin: 7em auto 5em;
    border: solid 5px $background-color-light;

    .circles {
      display: block;
      width: 140px;
      height: 140px;
      line-height: 140px;
      text-align: center;
      background: linear-gradient(to top, $background-color, $background-color-light);
      border-radius: 50%;
      font-weight: 600;
      transition: .25s;
      text-decoration: none;
      color: $text-color;
    }

    .active-circle {
    }

    .active-circle:hover,
    .active-circle:active {
      cursor: pointer;
      margin-top: 5px;
      box-shadow: 1px 1px 30px $background-color;
    }

    .not-active-circle {
      background: linear-gradient(to top, $not-active-color, $not-active-color-light);
    }

    .not-active-circle:hover {
      cursor: default;
    }

    #logo {
      margin-left: -6em;
      width: $logo-width;
      border-radius: 0;
      background: url('assets/agrologo.png') transparent no-repeat center/$logo-width $logo-height;
    }

  }
</style>
