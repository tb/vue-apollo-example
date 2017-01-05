import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import Tags from './Tags.vue';
import Pagination from './Pagination.vue';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { Client } from 'subscriptions-transport-ws';
import VueApollo, { addGraphQLSubscriptions } from 'vue-apollo';

const networkInterface = createNetworkInterface({
  uri: 'http://localhost:3020/graphql',
  transportBatching: true,
});

const wsClient = new Client('ws://localhost:3030');

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient,
);

const apolloClient = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
});

Vue.use(VueApollo, {
  apolloClient,
});

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    { path: '/', component: App,
      children: [
        { path: '/', component: Tags },
        { path: '/pagination', component: Pagination }
      ]
    }
  ]
});

const app = new Vue({
  router
}).$mount('#app');
