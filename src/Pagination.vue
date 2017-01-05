<template>
    <div>
        <h2>Pagination</h2>
        <div class="tag-list" v-if="tagsPage">
            <div class="tag-list-item" v-for="tag in tagsPage.tags">
                {{ tag.id }} - {{ tag.label }} - {{ tag.type }}
            </div>
            <div class="actions">
                <button v-if="showMoreEnabled" @click="showMore">Show more</button>
            </div>
        </div>
    </div>
</template>

<script>
import gql from 'graphql-tag';

const pageSize = 10;

export default {
  name: 'app',
  data: () => ({
    newTag: null,
    updateCount: 0,
    type: 'City',
    skipQuery: false,
    tagsLoading: 0,
    showTag: 'random',
    // Optional properties init
    tags: [],
    randomTag: null,
    page: 0,
    showMoreEnabled: true,
  }),
  apollo: {
    // Pages
    tagsPage: {
      // GraphQL Query
      query: gql`query tagsPage ($page: Int!, $pageSize: Int!) {
        tagsPage(page: $page, size: $pageSize) {
          tags {
            id
            label
            type
          }
          hasMore
        }
      }`,
      variables: {
        page: 0,
        pageSize,
      },
    },

    // Subscriptions
    subscribe: {
      tags: {
        query: gql`subscription tags($type: String!) {
          tagAdded(type: $type) {
            id
            label
            type
          }
        }`,
        // Reactive variables
        variables() {
          return {
            type: this.type,
          };
        },
        // Result hook
        result(data) {
          console.log(data);
          this.tags.push(data.tagAdded);
        },
        // Disable the subscription
        skip() {
          return this.skipQuery
        },
      },
    },
  },
  methods: {
    showMore() {
      this.page ++;
      this.$apollo.queries.tagsPage.fetchMore({
        variables: {
          page: this.page,
          pageSize,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const newTags = fetchMoreResult.data.tagsPage.tags;
          const hasMore = fetchMoreResult.data.tagsPage.hasMore;

          this.showMoreEnabled = hasMore;

          return {
            tagsPage: {
              tags: [...previousResult.tagsPage.tags, ...newTags],
              hasMore,
            },
          };
        },
      });
    },
  },
  mounted() {
    const subQuery = gql`subscription tags($type: String!) {
      tagAdded(type: $type) {
        id
        label
        type
      }
    }`;
    const observer = this.$apollo.subscribe({
      query: subQuery,
      variables: {
        type: 'City',
      },
    });

    observer.subscribe({
      next(data) {
        console.log(data);
      },
    });
  },
};
</script>

<style>
.info,
.loading {
  color: #999;
  margin: 12px;
}

.tag {
  display: inline-block;
  padding: 4px;
  background: #40b883;
  color: white;
  border-radius: 2px;
  margin: 2px;
}

.tag.optimistic {
  background: #b76c40;
}

form {
  margin: 22px;
}

input {
  padding: 8px;
  border: solid 1px #bbb;
  border-radius: 2px;
}

input:focus {
  box-shadow: none;
  outline: none;
  border-color: #40b883;
}

.tag-list {
  text-align: left;
  border: solid 1px #40b883;
  padding: 10px;
  border-radius: 3px;
}

.actions {
  text-align: center;
}
</style>
