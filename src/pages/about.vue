<template>
  <v-container>
    <v-card>
      <template #text>
        <div>
          <h2>{{ $t('about.title') }}</h2>

          <i18n-t keypath="about.author" tag="p">
            <template #project>
              <i>Arma3Sync Vue - v{{ VERSION }}</i>
            </template>

            <template #author>
              <a
                href="https://github.com/oxypomme"
                target="_blank"
                rel="noopener noreferrer"
                >oxypomme</a
              >
            </template>
          </i18n-t>
        </div>

        <div class="mt-6">
          <h2>{{ $t('about.copyright.title') }}</h2>
          <p>
            {{ $t('about.copyright.arma') }}<br />
            {{ $t('about.copyright.a3s') }}<br />
            {{ $t('about.copyright.notAffiliated') }}
          </p>
        </div>

        <div class="mt-6">
          <h2>{{ $t('about.thanks') }}</h2>

          <ul class="ml-5">
            <li>S.o.E Team</li>
            <li>
              <a
                href="https://grecedecanards.fr/online/"
                target="_blank"
                rel="noopener noreferrer"
                >Grèce de Canards</a
              >
            </li>
            <li>
              <a
                href="https://flagpedia.net/download/api"
                target="_blank"
                rel="noopener noreferrer"
                >Flagpedia</a
              >
            </li>
          </ul>
        </div>

        <div class="mt-6">
          <h2>{{ $t('about.privacy.title') }}</h2>

          <p>{{ $t('about.privacy.text') }}</p>
        </div>
      </template>

      <template #actions>
        <v-spacer />

        <v-btn
          v-tooltip="$t('about.github')"
          icon="mdi-github"
          variant="tonal"
          href="https://github.com/oxy-arma-scripts/arma3sync-vue/"
          target="_blank"
          rel="noopener noreferrer"
        />
      </template>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { version as VERSION } from '~/../package.json';
</script>
