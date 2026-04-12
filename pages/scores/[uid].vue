<template>
  <div class="container pt-6 pb-8 md:pt-8 md:pb-10">
    <div v-if="loading" class="space-y-6 animate-pulse">
      <div class="h-[220px] rounded-[30px] border border-border bg-white shadow-card" />
      <div class="h-[420px] rounded-[30px] border border-border bg-white shadow-card" />
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="h-[220px] rounded-[30px] border border-border bg-white shadow-card" />
        <div class="h-[220px] rounded-[30px] border border-border bg-white shadow-card" />
      </div>
      <div class="h-[240px] rounded-[30px] border border-border bg-white shadow-card" />
      <div class="h-[280px] rounded-[30px] border border-border bg-white shadow-card" />
      <div class="h-[320px] rounded-[30px] border border-border bg-white shadow-card" />
      <div class="h-[420px] rounded-[30px] border border-border bg-white shadow-card" />
    </div>

    <div v-else-if="profile" class="space-y-6">
      <section class="relative overflow-visible rounded-[30px] border border-border bg-white shadow-card">
        <div
          class="grid gap-8 rounded-[30px] px-6 py-6 md:grid-cols-[auto,1fr] md:px-8 md:py-8"
          :style="heroPanelStyle"
        >
          <div class="flex flex-col items-start gap-4">
            <ImgFallback
              :src="profile.realpic"
              :alt="userName"
              class="h-24 w-24 rounded-[26px] border border-white/80 object-cover shadow-[0_24px_50px_-28px_rgba(15,23,42,0.45)] md:h-28 md:w-28"
            />
          </div>

          <div>
            <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div class="flex flex-wrap items-center gap-3">
                  <h1 class="font-display text-3xl font-bold tracking-tight text-text-main md:text-4xl">
                    {{ userNameWithNickname }}
                  </h1>
                  <div v-if="starCount > 0" class="flex items-center gap-1.5">
                    <svg
                      v-for="index in starCount"
                      :key="`profile-star-${index}`"
                      class="h-6 w-6 md:h-7 md:w-7"
                      viewBox="0 0 24 24"
                      fill="#FFD86B"
                      aria-hidden="true"
                    >
                      <path d="M12 2.75l2.78 5.64 6.22.9-4.5 4.38 1.06 6.18L12 16.93l-5.56 2.92 1.06-6.18L3 9.29l6.22-.9L12 2.75z" />
                    </svg>
                  </div>
                </div>
                <div class="mt-2 flex min-h-14 flex-col justify-center gap-2">
                  <div class="flex flex-wrap items-center gap-y-1 text-sm leading-6 text-text-muted md:text-base">
                    <span>{{ profile.bg || '业余选手' }}</span>
                    <span v-if="formattedSex" class="ml-2">· {{ formattedSex }}</span>
                    <div
                      v-if="resideLabel"
                      class="relative ml-2 inline-flex items-center gap-2"
                      :class="activeMetricTooltip === RESIDE_CITY_TOOLTIP_KEY ? 'z-20' : ''"
                      @mouseenter="showMetricTooltip(RESIDE_CITY_TOOLTIP_KEY)"
                      @mouseleave="closeMetricTooltip"
                      @focusin="showMetricTooltip(RESIDE_CITY_TOOLTIP_KEY)"
                      @focusout="closeMetricTooltip"
                    >
                      <span>· 常驻 {{ resideLabel }}</span>
                      <button
                        type="button"
                        class="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-bold text-text-muted transition-colors hover:border-gray-400 hover:text-text-main"
                        :aria-label="RESIDE_CITY_TOOLTIP_TITLE"
                        @click.stop="toggleMetricTooltip(RESIDE_CITY_TOOLTIP_KEY)"
                      >
                        ?
                      </button>
                      <div
                        v-if="activeMetricTooltip === RESIDE_CITY_TOOLTIP_KEY"
                        class="absolute left-0 top-full z-30 mt-3 w-[min(86vw,340px)] rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-6 text-text-main shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)]"
                        @click.stop
                      >
                        <p class="text-base font-semibold" :style="{ color: accentColor }">{{ RESIDE_CITY_TOOLTIP_TITLE }}</p>
                        <p class="mt-2 whitespace-pre-line text-black/75">{{ RESIDE_CITY_TOOLTIP }}</p>
                      </div>
                    </div>
                  </div>
                  <div v-if="equipmentItems.length" class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm leading-6 text-text-muted md:text-base">
                    <span
                      v-for="item in equipmentItems"
                      :key="item.label"
                      class="inline-flex items-center gap-1.5"
                    >
                      <span class="text-text-light">{{ item.label }}</span>
                      <span class="font-medium text-text-main">{{ item.value }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-text-muted shadow-sm">
                <p class="font-medium text-text-main">最近更新</p>
                <p class="mt-1">{{ profile.lastUpdate || '暂无更新信息' }}</p>
              </div>
            </div>

            <div class="mt-6 grid gap-5 sm:grid-cols-2 xl:gap-6 xl:grid-cols-4">
              <article
                v-for="metric in heroMetrics"
                :key="metric.label"
                class="relative flex min-h-[156px] flex-col items-center justify-center rounded-[24px] border border-white/90 bg-white/95 px-5 py-6 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.9),0_18px_48px_-24px_rgba(15,23,42,0.22)]"
                :class="activeMetricTooltip === metric.label ? 'z-20' : ''"
              >
                <div class="flex w-full justify-center">
                  <div class="relative inline-flex items-center justify-center">
                    <p class="text-sm font-semibold text-text-light md:text-[15px]">{{ metric.label }}</p>
                    <div
                      v-if="metric.tooltip"
                      class="absolute left-full top-1/2 ml-2 -translate-y-1/2"
                      @mouseenter="showMetricTooltip(metric.label)"
                      @mouseleave="closeMetricTooltip"
                      @focusin="showMetricTooltip(metric.label)"
                      @focusout="closeMetricTooltip"
                    >
                      <button
                        type="button"
                        class="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-bold text-text-muted transition-colors hover:border-gray-400 hover:text-text-main"
                        :aria-label="`${metric.label}说明`"
                        @click.stop="toggleMetricTooltip(metric.label)"
                      >
                        ?
                      </button>
                      <div
                        v-if="activeMetricTooltip === metric.label"
                        class="absolute left-1/2 top-full z-30 mt-3 w-[min(86vw,340px)] -translate-x-1/2 rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-6 text-text-main shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)]"
                        @click.stop
                      >
                        <p class="text-base font-semibold" :style="{ color: accentColor }">{{ metric.tooltipTitle }}</p>
                        <p class="mt-2 whitespace-pre-line text-black/75">{{ metric.tooltip }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p class="mt-4 font-display text-[2.2rem] font-bold leading-none text-text-main md:text-[2.5rem]">{{ metric.value }}</p>
                <p v-if="metric.note" class="mt-3 text-base text-text-muted">{{ metric.note }}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-[30px] border border-border bg-white p-5 shadow-sm md:p-6">
        <div>
          <h2 class="flex items-center border-l-4 pl-3 font-display text-2xl font-bold text-text-main" :style="accentBorderStyle">{{ trendCardTitle }}</h2>
        </div>

        <ScoreDetailTrendChart class="mt-5" :points="trendPoints" :accent-color="accentColor" />
      </section>

      <section v-if="tagList.length" class="rounded-[30px] border border-border bg-white p-5 shadow-sm md:p-6">
        <div>
          <h2 class="flex items-center border-l-4 pl-3 font-display text-2xl font-bold text-text-main" :style="accentBorderStyle">{{ evaluationCardTitle }}</h2>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <span
            v-for="tag in tagList"
            :key="tag.eid"
            class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm"
            :class="getTagToneClass(tag.etype)"
          >
            <span>{{ tag.ename }}</span>
            <span
              class="rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="getTagCountToneClass(tag.etype)"
            >
              {{ tag.count }}
            </span>
          </span>
        </div>
      </section>

      <section class="rounded-[30px] border border-border bg-white p-5 shadow-sm md:p-6">
        <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 class="flex items-center border-l-4 pl-3 font-display text-2xl font-bold text-text-main" :style="accentBorderStyle">{{ journeyCardTitle }}</h2>
          </div>
          <div class="flex flex-wrap gap-2 text-sm">
            <span
              v-for="stat in journeyStats"
              :key="stat.label"
              class="rounded-full bg-surfaceSoft px-3 py-1 text-text-muted"
            >
              <span>{{ `${stat.label} ` }}</span>
              <span class="font-semibold" :style="{ color: accentColor }">{{ stat.value }}</span>
            </span>
          </div>
        </div>
        <div class="mt-5 rounded-[24px] border border-border bg-[linear-gradient(135deg,rgba(248,250,252,0.95),rgba(255,255,255,1))] p-5">
          <p class="whitespace-pre-line text-[15px] leading-8 text-text-main" v-html="journeyDescriptionHtml"></p>
        </div>
      </section>

      <section class="rounded-[30px] border border-border bg-white p-5 shadow-sm md:p-6">
        <div>
          <h2 class="flex items-center border-l-4 pl-3 font-display text-2xl font-bold text-text-main" :style="accentBorderStyle">{{ opponentCardTitle }}</h2>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="group in relationGroups"
            :key="group.title"
            class="rounded-[24px] border border-border bg-[linear-gradient(135deg,rgba(248,250,252,0.88),rgba(255,255,255,1))] p-5"
          >
            <h3 class="flex items-center border-l-4 pl-3 text-lg font-semibold text-text-main" :style="accentBorderStyle">{{ group.title }}</h3>
            <div class="mt-4 flex flex-wrap gap-2.5">
              <template v-for="item in group.items" :key="`${group.title}-${item.label}`">
                <NuxtLink
                  v-if="item.uid"
                  :to="`/scores/${item.uid}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex max-w-full items-center rounded-full border border-border bg-white px-3.5 py-2 text-sm font-medium text-text-main shadow-sm transition-colors hover:border-brand-primary/20 hover:text-brand-primary"
                >
                  <span class="truncate">{{ item.label }}</span>
                </NuxtLink>
                <span
                  v-else
                  class="inline-flex max-w-full items-center rounded-full border border-border bg-white px-3.5 py-2 text-sm font-medium text-text-main shadow-sm"
                >
                  <span class="truncate">{{ item.label }}</span>
                </span>
              </template>
            </div>
          </article>
        </div>
      </section>

      <section class="rounded-[30px] border border-border bg-white p-5 shadow-sm md:p-6">
        <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 class="flex items-center border-l-4 pl-3 font-display text-2xl font-bold text-text-main" :style="accentBorderStyle">{{ cityCardTitle }}</h2>
          </div>
          <p class="text-sm text-text-muted">共 {{ cityList.length }} 个地区</p>
        </div>

        <div v-if="cityList.length" class="mt-5 flex flex-wrap gap-3">
          <span
            v-for="city in cityList"
            :key="city"
            class="inline-flex items-center rounded-full border border-border bg-surfaceSoft px-4 py-2 text-sm font-medium text-text-main"
          >
            {{ city }}
          </span>
        </div>
        <p v-else class="mt-5 rounded-[24px] border border-dashed border-border bg-surfaceSoft/60 px-4 py-10 text-center text-sm text-text-muted">
          暂无参赛地区信息
        </p>
      </section>

      <section v-if="championChallenge" class="overflow-hidden rounded-[30px] border border-border bg-white p-5 shadow-sm md:p-6">
        <div
          class="rounded-[26px] border border-border/70 px-4 py-4 md:px-5"
          :style="championChallengePanelStyle"
        >
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="min-w-0">
              <p
                class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                :style="{ backgroundColor: toRgba(accentColor, 0.1), color: accentColor }"
              >
                挑战冠军
              </p>
              <h2 class="mt-3 text-2xl font-bold tracking-tight text-text-main md:text-[2rem]">
                {{ userName }}
                <span class="mx-1 font-display" :style="{ color: accentColor }">{{ championChallenge.stepCount }}</span>
                阶挑战战世界冠军
                <span class="ml-1" :style="{ color: accentColor }">{{ championChallenge.championName }}</span>
                成功
              </h2>
              <p v-if="championChallenge.pathWords.length" class="mt-2 text-sm leading-6 text-text-muted">
                挑战链：{{ championChallenge.pathWords.join(' → ') }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2 text-sm">
              <span class="rounded-full bg-white/85 px-3 py-1 text-text-muted shadow-sm">
                关键比赛
                <span class="font-semibold" :style="{ color: accentColor }">{{ championChallenge.steps.length }}</span>
                场
              </span>
              <span v-if="championChallenge.latestDate" class="rounded-full bg-white/85 px-3 py-1 text-text-muted shadow-sm">
                最近一场 {{ championChallenge.latestDate }}
              </span>
            </div>
          </div>

          <div v-if="championChallenge.steps.length" class="mt-6 grid gap-4 xl:grid-cols-2">
            <article
              v-for="(step, index) in championChallenge.steps"
              :key="step.id"
              class="group relative overflow-hidden rounded-[26px] border border-white/80 bg-white/92 p-4 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.28)]"
              :style="buildChampionStepStyle(index)"
            >
              <div class="relative flex items-center gap-3">
                <div class="shrink-0">
                  <a
                    v-if="step.left.uid"
                    :href="`/scores/${step.left.uid}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block"
                  >
                    <ImgFallback :src="step.left.avatar" :alt="step.left.name" class="h-16 w-16 rounded-full border border-white/80 object-cover shadow-sm" />
                  </a>
                  <ImgFallback
                    v-else
                    :src="step.left.avatar"
                    :alt="step.left.name"
                    class="h-16 w-16 rounded-full border border-white/80 object-cover shadow-sm"
                  />
                </div>

                <div class="min-w-0 flex-1 text-center">
                  <div class="flex items-center justify-center gap-2 text-[17px] font-semibold leading-6 text-text-main md:text-lg">
                    <a
                      v-if="step.left.uid"
                      :href="`/scores/${step.left.uid}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="max-w-[84px] truncate transition-colors hover:text-brand-primary"
                    >
                      {{ step.left.name }}
                    </a>
                    <span v-else class="max-w-[84px] truncate">{{ step.left.name }}</span>
                    <span class="rounded-full px-3 py-1 font-display text-lg shadow-sm" :class="step.scoreToneClass">
                      {{ step.scoreline }}
                    </span>
                    <a
                      v-if="step.right.uid"
                      :href="`/scores/${step.right.uid}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="max-w-[84px] truncate transition-colors hover:text-brand-primary"
                    >
                      {{ step.right.name }}
                    </a>
                    <span v-else class="max-w-[84px] truncate">{{ step.right.name }}</span>
                  </div>
                  <p class="mt-2 line-clamp-2 text-sm font-medium leading-6 text-text-main/80">{{ step.title || '赛事信息待补充' }}</p>
                  <p class="mt-1 text-sm text-text-muted">
                    {{ step.dateline || '时间未知' }}
                    <span v-if="step.city"> · {{ step.city }}</span>
                  </p>
                </div>

                <div class="shrink-0">
                  <a
                    v-if="step.right.uid"
                    :href="`/scores/${step.right.uid}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block"
                  >
                    <ImgFallback :src="step.right.avatar" :alt="step.right.name" class="h-16 w-16 rounded-full border border-white/80 object-cover shadow-sm" />
                  </a>
                  <ImgFallback
                    v-else
                    :src="step.right.avatar"
                    :alt="step.right.name"
                    class="h-16 w-16 rounded-full border border-white/80 object-cover shadow-sm"
                  />
                </div>
              </div>
            </article>
          </div>

          <div v-else-if="championChallenge.pathWords.length" class="mt-6 flex flex-wrap gap-3">
            <span
              v-for="(name, index) in championChallenge.pathWords"
              :key="`${name}-${index}`"
              class="inline-flex items-center rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm font-medium text-text-main shadow-sm"
            >
              {{ name }}
            </span>
          </div>
        </div>
      </section>

      <section v-if="recentHonors.length" class="rounded-[30px] border border-border bg-white p-5 shadow-sm md:p-6">
        <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 class="flex items-center border-l-4 pl-3 font-display text-2xl font-bold text-text-main" :style="accentBorderStyle">{{ honorCardTitle }}</h2>
          </div>
          <p class="text-sm text-text-muted">最近 {{ recentHonors.length }} 条</p>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="honor in recentHonors"
            :key="honor.hid || `${honor.subject}-${honor.posttime}`"
            class="rounded-[24px] border border-border bg-[linear-gradient(135deg,rgba(255,249,235,0.5),rgba(255,255,255,1)_38%,rgba(248,250,252,1))] p-4"
          >
            <div class="flex items-start gap-3">
              <img :src="honor.honor" alt="" class="mt-0.5 h-10 w-10 shrink-0" />
              <div class="min-w-0 flex-1">
                <p class="text-[15px] font-semibold leading-6 text-text-main">{{ honor.subject }}</p>
                <p class="mt-2 text-sm text-text-muted">{{ formatUnixDate(honor.posttime) || '时间未知' }}</p>
              </div>
            </div>

            <NuxtLink
              v-if="honor.eventid"
              :to="`/matches/${honor.eventid}`"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-primary transition-colors hover:text-brand-primaryHover"
            >
              查看赛事
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </article>
        </div>
      </section>

      <section class="rounded-[30px] border border-border bg-white p-5 shadow-sm md:p-6">
        <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 class="flex items-center border-l-4 pl-3 font-display text-2xl font-bold text-text-main" :style="accentBorderStyle">{{ resultCardTitle }}</h2>
          </div>
          <p class="text-sm text-text-muted">{{ resultRows.length }} 条已加载</p>
        </div>

        <div class="mt-6 overflow-hidden rounded-[24px] border border-border">
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead class="bg-surfaceSoft text-text-muted">
                <tr>
                  <th class="px-4 py-3 font-medium">序号</th>
                  <th class="px-4 py-3 font-medium">姓名</th>
                  <th class="px-4 py-3 font-medium">姓名</th>
                  <th class="px-4 py-3 text-center font-medium">比分</th>
                  <th class="px-4 py-3 text-center font-medium">变化</th>
                  <th class="px-4 py-3 font-medium">日期</th>
                  <th class="px-4 py-3 font-medium">比赛</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="row in resultRows" :key="row.id" class="transition-colors hover:bg-surfaceMuted/70">
                  <td class="align-middle px-4 py-4 text-center text-text-muted">{{ row.sequence }}</td>
                  <td class="align-middle min-w-[128px] px-4 py-4">
                    <div class="space-y-1.5">
                      <template v-for="member in row.selfTeam" :key="`${row.id}-self-${member.uid || member.name}`">
                        <NuxtLink
                          v-if="member.uid && member.uid !== uid"
                          :to="`/scores/${member.uid}`"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="block font-medium text-brand-primary transition-colors hover:text-brand-primaryHover"
                        >
                          {{ member.name }}
                        </NuxtLink>
                        <span v-else class="block font-medium text-text-main">{{ member.name }}</span>
                      </template>
                    </div>
                  </td>
                  <td class="align-middle min-w-[128px] px-4 py-4">
                    <div class="space-y-1.5">
                      <template v-for="member in row.opponentTeam" :key="`${row.id}-opponent-${member.uid || member.name}`">
                        <NuxtLink
                          v-if="member.uid"
                          :to="`/scores/${member.uid}`"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="block font-medium text-brand-primary transition-colors hover:text-brand-primaryHover"
                        >
                          {{ member.name }}
                        </NuxtLink>
                        <span v-else class="block font-medium text-text-main">{{ member.name }}</span>
                      </template>
                    </div>
                  </td>
                  <td class="align-middle px-4 py-4">
                    <div class="flex justify-center">
                      <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" :class="row.scoreToneClass">
                        {{ row.scoreline }}
                      </span>
                    </div>
                  </td>
                  <td class="align-middle px-4 py-4">
                    <div class="flex justify-center">
                      <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" :class="row.deltaToneClass">
                        {{ row.deltaText }}
                      </span>
                    </div>
                  </td>
                  <td class="align-middle whitespace-nowrap px-4 py-4 text-text-main">{{ row.dateText }}</td>
                  <td class="align-top min-w-[220px] px-4 py-4">
                    <NuxtLink
                      v-if="row.eventHref"
                      :to="row.eventHref"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="block whitespace-normal break-words font-medium text-text-main transition-colors hover:text-brand-primary"
                    >
                      {{ row.eventTitle }}
                    </NuxtLink>
                    <span v-else class="block whitespace-normal break-words font-medium text-text-main">{{ row.eventTitle }}</span>
                    <p v-if="row.locationText" class="mt-1 text-xs text-text-light">{{ row.locationText }}</p>
                  </td>
                </tr>
                <tr v-if="!resultRows.length">
                  <td colspan="7" class="px-4 py-10 text-center text-sm text-text-muted">暂无近期战绩</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="gamesLoadingMore" class="border-t border-border bg-surfaceSoft/40 px-4 py-4 text-center text-sm text-text-muted">
            正在加载更多战绩...
          </div>
          <div v-else-if="!gamesHasMore && resultRows.length" class="border-t border-border bg-surfaceSoft/30 px-4 py-4 text-center text-sm text-text-light">
            已加载全部战绩
          </div>

          <div
            v-if="gamesHasMore"
            ref="gamesLoadMoreSentinel"
            class="h-px w-full opacity-0 pointer-events-none"
            aria-hidden="true"
          ></div>
        </div>
      </section>
    </div>

    <div v-else class="py-16 text-center text-text-muted">未找到该选手</div>
  </div>
</template>

<script setup>
import {
  fetchAdvProfile,
  fetchUserGames,
  fetchUserScores,
  fetchUserTags
} from '@/services/user'
import { fetchMatchDetail } from '@/services/match'

const GAME_PAGE_SIZE = 10
const FEMALE_ACCENT_COLOR = '#D61F26'
const MALE_ACCENT_COLOR = '#04a2eb'
const ANNUAL_SCORE_TOOLTIP = '年度积分 = 过去12个月的最高积分 - 参赛次数奖励分 + 爆冷输球罚分 + 获得名次的奖励分\n\n具体详情，请见网站日志'
const RESIDE_CITY_TOOLTIP_KEY = '所在城市说明'
const RESIDE_CITY_TOOLTIP_TITLE = '所在城市说明'
const RESIDE_CITY_TOOLTIP = '当用户到达一个城市后，要在该城市待满14天（首尾均以登录开球网小程序为准），所在地才会更新为该城市'

const route = useRoute()
const { $api } = useNuxtApp()

const uid = computed(() => String(route.params.uid || ''))
const profile = ref(null)
const scoreHistory = ref([])
const tagList = ref([])
const games = ref([])
const eventDetailsMap = ref({})
const loading = ref(true)
const gamesLoadingMore = ref(false)
const gamesHasMore = ref(false)
const gamePage = ref(1)
const activeMetricTooltip = ref('')
const pendingEventDetailIds = new Set()

const canAutoLoadGames = computed(() => gamesHasMore.value && !loading.value && !gamesLoadingMore.value)
const { loadMoreSentinel: gamesLoadMoreSentinel } = useAutoLoadMore({
  canLoadMore: canAutoLoadGames,
  onLoadMore: () => loadGames(gamePage.value + 1)
})

const userName = computed(() => profile.value?.realname || profile.value?.username || '该选手')
const userNickname = computed(() => String(profile.value?.username || '').trim())
const userNameWithNickname = computed(() => {
  if (!userNickname.value || userNickname.value === userName.value) return userName.value
  return `${userName.value}(${userNickname.value})`
})
const starCount = computed(() => {
  const value = Number(profile.value?.star || 0)
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.min(5, Math.floor(value))
})
const formattedSex = computed(() => formatSex(profile.value?.sex))
const resideLabel = computed(() => {
  const province = normalizeDisplayText(profile.value?.resideprovince)
  const city = normalizeDisplayText(profile.value?.residecity)

  if (province && city) {
    return province.includes(city) ? province : `${province} ${city}`
  }

  return province || city
})
const equipmentItems = computed(() => ([
  { label: '底板型号', value: formatEquipmentValue(profile.value?.qiupai, profile.value?.qiupaitype) },
  { label: '正手套胶', value: formatEquipmentValue(profile.value?.zhengshou, profile.value?.zhengshoutype) },
  { label: '反手套胶', value: formatEquipmentValue(profile.value?.fanshou, profile.value?.fanshoutype) }
]).filter((item) => item.value))
const accentColor = computed(() => formattedSex.value === '男' ? MALE_ACCENT_COLOR : FEMALE_ACCENT_COLOR)
const accentBorderStyle = computed(() => ({
  borderColor: accentColor.value
}))
const heroPanelStyle = computed(() => ({
  backgroundImage: `radial-gradient(circle at top left, ${toRgba(accentColor.value, 0.2)}, transparent 42%), linear-gradient(135deg, ${toRgba(accentColor.value, 0.1)} 0%, #ffffff 54%, ${toRgba(accentColor.value, 0.04)} 100%)`
}))

useHead(() => ({
  title: profile.value ? `${userName.value}的积分详情` : '积分详情'
}))

const heroMetrics = computed(() => ([
  {
    label: '当前积分',
    value: profile.value?.score || '-'
  },
  {
    label: '年度积分',
    value: profile.value?.maxScoreTheYear || '-',
    tooltipTitle: '年度积分说明',
    tooltip: ANNUAL_SCORE_TOOLTIP
  },
  {
    label: '历史最高',
    value: profile.value?.maxscore || '-'
  },
  {
    label: '全国排名',
    value: profile.value?.rank || '-'
  }
]))

const trendPoints = computed(() => {
  const rows = Array.isArray(scoreHistory.value) ? [...scoreHistory.value] : []

  return rows
    .sort((left, right) => String(left?.dateline || '').localeCompare(String(right?.dateline || '')))
    .slice(-40)
    .map((row, index) => {
      const cityLabel = [row?.province, row?.city].filter(Boolean).join(' ')
      const locationLabel = row?.location
        ? [cityLabel, row.location].filter(Boolean).join(' · ')
        : cityLabel || '未知地点'

      return {
        id: `${row?.eventid || 'event'}-${row?.itemid || 'item'}-${row?.dateline || index}-${index}`,
        postscore: Number(row?.postscore || 0),
        postscoreText: String(row?.postscore || '-'),
        dateText: formatScoreDate(row?.dateline),
        placeText: locationLabel,
        title: row?.title || '未命名比赛'
      }
    })
})

const trendSectionTitle = computed(() => `${userName.value}最近${trendPoints.value.length}场比赛积分趋势`)
const trendCardTitle = computed(() => `${userName.value}最近${trendPoints.value.length}场比赛积分趋势`)
const evaluationCardTitle = computed(() => `${userName.value}收到最多的评价`)
const journeyCardTitle = computed(() => `${userName.value}的积分旅程`)
const opponentCardTitle = computed(() => `${userName.value}的交手概览`)
const cityCardTitle = computed(() => `${userName.value}曾在以下地区比赛`)
const honorCardTitle = computed(() => `${userName.value}的近期荣誉`)
const resultCardTitle = computed(() => `${userNameWithNickname.value}的近期战绩`)
const journeyStats = computed(() => ([
  { label: '参赛城市', value: profile.value?.cityNum || 0 },
  { label: '金牌', value: profile.value?.goldNum || 0 },
  { label: '最大连胜', value: profile.value?.maxConsWin || 0 }
]))
const journeyDescriptionHtml = computed(() => {
  const text = profile.value?.description || '暂无旅程描述。'
  return highlightNumbersHtml(text, accentColor.value)
})

const relationGroups = computed(() => {
  const detail = profile.value || {}

  return [
    {
      title: '曾战胜的前三名',
      items: buildNamedLinkList(detail.Top3OfBeatUsernameScore, detail.Top3OfBeat)
    },
    {
      title: '曾交手的前三名',
      items: buildNamedLinkList(detail.TopPlayerUsernameScore, detail.TopPlayer)
    },
    {
      title: '曾战胜的男子前三名',
      items: buildNamedLinkList(detail.Top3ManOfBeatUsernameScore, detail.Top3ManOfBeat)
    },
    {
      title: '曾战胜的女子前三名',
      items: buildNamedLinkList(detail.Top3WomanOfBeatUsernameScore, detail.Top3WomanOfBeat)
    },
    {
      title: '苦主',
      items: buildNamedLinkList(detail.KuZhu?.names, detail.KuZhu?.uids)
    },
    {
      title: '福星',
      items: buildNamedLinkList(detail.FuXing?.names, detail.FuXing?.uids)
    }
  ].filter((group) => group.items.length)
})

const cityList = computed(() => {
  if (!Array.isArray(profile.value?.allCities)) return []
  return profile.value.allCities.filter(Boolean)
})
const championChallenge = computed(() => {
  const championName = normalizeDisplayText(profile.value?.champion)
  if (!championName) return null

  const steps = normalizeChampionPath(profile.value?.path).map((step, index) => {
    const leftScore = normalizeMatchScore(step?.result1)
    const rightScore = normalizeMatchScore(step?.result2)
    const leftNumeric = Number(leftScore)
    const rightNumeric = Number(rightScore)
    const scoreToneClass = Number.isFinite(leftNumeric) && Number.isFinite(rightNumeric)
      ? leftNumeric > rightNumeric
        ? 'bg-emerald-50 text-emerald-700'
        : leftNumeric < rightNumeric
          ? 'bg-rose-50 text-rose-700'
          : 'bg-slate-100 text-slate-600'
      : 'bg-slate-100 text-slate-600'

    return {
      id: `champion-path-${step?.uid1 || step?.realname1 || 'left'}-${step?.uid2 || step?.realname2 || 'right'}-${step?.dateline || index}`,
      left: {
        uid: normalizeUidValue(step?.uid1),
        name: normalizeDisplayText(step?.realname1) || '未知选手',
        avatar: normalizeDisplayText(step?.face1)
      },
      right: {
        uid: normalizeUidValue(step?.uid2),
        name: normalizeDisplayText(step?.realname2) || '未知选手',
        avatar: normalizeDisplayText(step?.face2)
      },
      scoreline: leftScore && rightScore ? `${leftScore}:${rightScore}` : [leftScore, rightScore].filter(Boolean).join(':') || '-',
      scoreToneClass,
      title: normalizeDisplayText(step?.title),
      city: normalizeDisplayText(step?.city),
      dateline: normalizeDisplayText(step?.dateline)
    }
  })
  const pathWords = String(profile.value?.pathWords || '')
    .split('-')
    .map((item) => normalizeDisplayText(item))
    .filter(Boolean)
  const stepCount = normalizePositiveNumber(profile.value?.pathNum) || steps.length

  return {
    championName,
    pathWords,
    steps,
    stepCount,
    latestDate: steps[0]?.dateline || ''
  }
})
const championChallengePanelStyle = computed(() => ({
  backgroundImage: `radial-gradient(circle at top right, ${toRgba(accentColor.value, 0.16)}, transparent 34%), linear-gradient(135deg, ${toRgba(accentColor.value, 0.08)}, rgba(255,255,255,0.96) 42%, ${toRgba(accentColor.value, 0.03)} 100%)`
}))

const recentHonors = computed(() => {
  if (!Array.isArray(profile.value?.honors)) return []

  return [...profile.value.honors]
    .sort((left, right) => Number(right?.posttime || 0) - Number(left?.posttime || 0))
    .slice(0, 10)
})

const eventLookup = computed(() => {
  const mapping = {}

  scoreHistory.value.forEach((row) => {
    const key = String(row?.eventid || '')
    if (!key) return

    mapping[key] = {
      title: normalizeDisplayText(row?.title),
      locationText: [row?.province, row?.city, row?.location].filter(Boolean).join(' · ')
    }
  })

  Object.entries(eventDetailsMap.value).forEach(([key, detail]) => {
    mapping[key] = {
      title: detail?.title || mapping[key]?.title || '',
      locationText: detail?.locationText || mapping[key]?.locationText || ''
    }
  })

  return mapping
})

const resultRows = computed(() => {
  return games.value.map((game, index) => {
    const isSelfFirst = String(game?.uid1 || '') === uid.value
    const selfScore = isSelfFirst ? Number(game?.result1 || 0) : Number(game?.result2 || 0)
    const opponentScore = isSelfFirst ? Number(game?.result2 || 0) : Number(game?.result1 || 0)
    const deltaText = normalizeDeltaText(isSelfFirst ? game?.score1 : game?.score2)
    const eventId = String(game?.eventid || '').trim()
    const eventMeta = eventLookup.value[eventId] || {}
    const selfTeam = isSelfFirst
      ? buildGameTeam(game?.uid1, game?.username1, game?.uid11, game?.username11)
      : buildGameTeam(game?.uid2, game?.username2, game?.uid22, game?.username22)
    const opponentTeam = isSelfFirst
      ? buildGameTeam(game?.uid2, game?.username2, game?.uid22, game?.username22)
      : buildGameTeam(game?.uid1, game?.username1, game?.uid11, game?.username11)

    return {
      id: game?.gameid || `${game?.eventid || 'event'}-${index}`,
      sequence: index + 1,
      selfTeam,
      opponentTeam,
      scoreline: `${selfScore}:${opponentScore}`,
      scoreToneClass: selfScore > opponentScore
        ? 'bg-emerald-50 text-emerald-700'
        : selfScore < opponentScore
          ? 'bg-rose-50 text-rose-700'
          : 'bg-slate-100 text-slate-600',
      deltaText,
      deltaToneClass: getDeltaToneClass(deltaText),
      dateText: formatScoreDate(game?.dateline),
      eventTitle: eventMeta.title || normalizeDisplayText(game?.title) || `赛事 ${eventId || '-'}`,
      eventHref: eventId ? `/matches/${eventId}` : '',
      locationText: eventMeta.locationText || ''
    }
  })
})

function formatScoreDate(value) {
  const text = String(value || '').trim()

  if (/^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`
  }

  return text || '未知时间'
}

function formatUnixDate(value) {
  const timestamp = Number(value)

  if (!Number.isFinite(timestamp) || timestamp <= 0) return ''

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(timestamp * 1000))
}

function toRgba(hex, alpha) {
  const normalized = String(hex || '').replace('#', '').trim()
  const value = normalized.length === 3
    ? normalized.split('').map((part) => `${part}${part}`).join('')
    : normalized

  if (!/^[\da-fA-F]{6}$/.test(value)) {
    return `rgba(214,31,38,${alpha})`
  }

  const red = Number.parseInt(value.slice(0, 2), 16)
  const green = Number.parseInt(value.slice(2, 4), 16)
  const blue = Number.parseInt(value.slice(4, 6), 16)

  return `rgba(${red},${green},${blue},${alpha})`
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function highlightNumbersHtml(text, color) {
  return escapeHtml(text)
    .replace(/(\d+(?:\.\d+)?%?)/g, `<span style="color:${color};font-weight:600;">$1</span>`)
    .replace(/\n/g, '<br>')
}

function formatSex(value) {
  if (String(value) === '1') return '男'
  if (String(value) === '2') return '女'
  if (!value) return ''
  return String(value)
}

function normalizeDisplayText(value) {
  const text = String(value || '').trim()
  return text && text !== '-' ? text : ''
}

function normalizeUidValue(value) {
  const text = String(value || '').trim()
  return text && text !== '0' ? text : ''
}

function normalizeGameMemberName(value) {
  const text = String(value || '').trim()
  return text && text !== '-' && text !== '0' ? text : ''
}

function normalizeMatchScore(value) {
  const text = String(value || '').trim()
  return text && text !== '-' ? text : ''
}

function normalizePositiveNumber(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0
}

function normalizeChampionPath(value) {
  if (Array.isArray(value)) return value
  if (!value) return []
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function formatEquipmentValue(brand, type) {
  const brandText = normalizeDisplayText(brand)
  const typeText = normalizeDisplayText(type)

  if (!brandText && !typeText) return ''
  if (!brandText) return typeText
  if (!typeText) return brandText

  const normalizedBrand = brandText.replace(/\s+/g, '').toLowerCase()
  const normalizedType = typeText.replace(/\s+/g, '').toLowerCase()

  if (normalizedBrand.includes(normalizedType)) return brandText
  if (normalizedType.includes(normalizedBrand)) return typeText

  return `${brandText} ${typeText}`
}

function buildGameMember(uid, name) {
  const memberName = normalizeGameMemberName(name)

  if (!memberName) return null

  return {
    uid: normalizeUidValue(uid),
    name: memberName
  }
}

function buildGameTeam(primaryUid, primaryName, partnerUid, partnerName) {
  const members = [
    buildGameMember(primaryUid, primaryName),
    buildGameMember(partnerUid, partnerName)
  ].filter(Boolean)

  return members.length ? members : [{ uid: '', name: '-' }]
}

function buildMatchLocationText(detail) {
  const segments = [
    normalizeDisplayText(detail?.arena_name),
    normalizeDisplayText(detail?.address)
  ].filter(Boolean)

  return [...new Set(segments)].join(' · ')
}

function buildChampionStepStyle(index) {
  const anchor = index % 2 === 0 ? 'top left' : 'top right'

  return {
    backgroundImage: `radial-gradient(circle at ${anchor}, ${toRgba(accentColor.value, 0.14)}, transparent 36%), linear-gradient(135deg, rgba(255,255,255,0.96), ${toRgba(accentColor.value, 0.05)} 100%)`
  }
}

function normalizeTags(rows) {
  if (!Array.isArray(rows)) return []

  return rows
    .map((row) => ({
      ...row,
      count: Number(row?.count ?? row?.count_origin ?? 0),
      etype: Number(row?.etype ?? 0)
    }))
    .filter((row) => row.count > 0)
}

function getTagToneClass(etype) {
  if (Number(etype) === 1) return 'border-emerald-200 bg-emerald-50/90 text-emerald-800'
  if (Number(etype) === 0) return 'border-amber-200 bg-amber-50/90 text-amber-800'
  if (Number(etype) === -1) return 'border-rose-200 bg-rose-50/90 text-rose-800'
  return 'border-border bg-white/85 text-text-main'
}

function getTagCountToneClass(etype) {
  if (Number(etype) === 1) return 'bg-emerald-100 text-emerald-700'
  if (Number(etype) === 0) return 'bg-amber-100 text-amber-700'
  if (Number(etype) === -1) return 'bg-rose-100 text-rose-700'
  return 'bg-slate-100 text-slate-600'
}

function parseUidList(source) {
  return String(source || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function buildNamedLinkList(names, uidSource) {
  const labels = Array.isArray(names) ? names.filter(Boolean).slice(0, 3) : []
  const uids = Array.isArray(uidSource) ? uidSource.map((item) => String(item || '')) : parseUidList(uidSource)

  return labels.map((label, index) => ({
    label: String(label),
    uid: uids[index] || ''
  }))
}

function normalizeDeltaText(value) {
  const text = String(value ?? '').trim()

  if (!text || text === '-') return '0'
  if (text === '0') return '0'
  if (text.startsWith('+') || text.startsWith('-')) return text

  const numeric = Number(text)
  if (Number.isFinite(numeric) && numeric > 0) return `+${numeric}`

  return text
}

function getDeltaToneClass(value) {
  if (String(value).startsWith('+')) return 'bg-emerald-50 text-emerald-700'
  if (String(value).startsWith('-')) return 'bg-rose-50 text-rose-700'
  return 'bg-slate-100 text-slate-600'
}

function appendUniqueGames(currentRows, nextRows) {
  const merged = [...currentRows]
  const seen = new Set(currentRows.map((row) => String(row?.gameid || '')))

  nextRows.forEach((row) => {
    const key = String(row?.gameid || '')
    if (key && seen.has(key)) return
    seen.add(key)
    merged.push(row)
  })

  return merged
}

function toggleMetricTooltip(label) {
  activeMetricTooltip.value = activeMetricTooltip.value === label ? '' : label
}

function showMetricTooltip(label) {
  activeMetricTooltip.value = label
}

function closeMetricTooltip() {
  activeMetricTooltip.value = ''
}

async function hydrateMissingEventDetails(rows) {
  const eventIds = [...new Set(
    (Array.isArray(rows) ? rows : [])
      .map((row) => String(row?.eventid || '').trim())
      .filter(Boolean)
  )].filter((eventId) => {
    if (pendingEventDetailIds.has(eventId)) return false
    if (eventLookup.value[eventId]?.title) return false
    return true
  })

  if (!eventIds.length) return

  eventIds.forEach((eventId) => pendingEventDetailIds.add(eventId))

  const results = await Promise.allSettled(
    eventIds.map((eventId) => fetchMatchDetail($api, { id: eventId }))
  )

  const nextMap = { ...eventDetailsMap.value }

  results.forEach((result, index) => {
    const eventId = eventIds[index]
    const detail = result.status === 'fulfilled' ? result.value?.data?.detail : null
    const title = normalizeDisplayText(detail?.title)
    const locationText = buildMatchLocationText(detail)

    if (title || locationText) {
      nextMap[eventId] = {
        title: title || nextMap[eventId]?.title || '',
        locationText: locationText || nextMap[eventId]?.locationText || ''
      }
    }

    pendingEventDetailIds.delete(eventId)
  })

  eventDetailsMap.value = nextMap
}

function resetPageState() {
  closeMetricTooltip()
  profile.value = null
  scoreHistory.value = []
  tagList.value = []
  games.value = []
  eventDetailsMap.value = {}
  pendingEventDetailIds.clear()
  gamesHasMore.value = false
  gamesLoadingMore.value = false
  gamePage.value = 1
}

async function loadAll() {
  loading.value = true
  resetPageState()

  const [
    profileResult,
    scoresResult,
    tagsResult
  ] = await Promise.allSettled([
    fetchAdvProfile($api, { uid: uid.value }),
    fetchUserScores($api, { uid: uid.value }),
    fetchUserTags($api, { uid: uid.value, limitByCount: 6, getNegative: false })
  ])

  if (profileResult.status === 'fulfilled') {
    profile.value = profileResult.value?.data || null
  }

  if (scoresResult.status === 'fulfilled') {
    scoreHistory.value = Array.isArray(scoresResult.value?.data) ? scoresResult.value.data : []
  }

  if (tagsResult.status === 'fulfilled') {
    tagList.value = normalizeTags(tagsResult.value?.data).slice(0, 6)
  }

  if (profile.value) {
    const rows = Array.isArray(profile.value?.games?.data) ? profile.value.games.data : []
    games.value = rows
    await hydrateMissingEventDetails(rows)
    gamesHasMore.value = rows.length >= GAME_PAGE_SIZE
  }

  loading.value = false
}

async function loadGames(page) {
  if (loading.value || gamesLoadingMore.value || !gamesHasMore.value) return

  gamesLoadingMore.value = true

  try {
    const response = await fetchUserGames($api, { uid: uid.value, page })
    const rows = Array.isArray(response?.data?.data) ? response.data.data : []

    games.value = appendUniqueGames(games.value, rows)
    void hydrateMissingEventDetails(rows)
    gamePage.value = page
    gamesHasMore.value = rows.length >= GAME_PAGE_SIZE
  } catch {
    gamesHasMore.value = false
  } finally {
    gamesLoadingMore.value = false
  }
}

onMounted(loadAll)

onMounted(() => {
  if (!process.client) return
  document.addEventListener('click', closeMetricTooltip)
})

onBeforeUnmount(() => {
  if (!process.client) return
  document.removeEventListener('click', closeMetricTooltip)
})

watch(uid, (nextUid, prevUid) => {
  if (nextUid && nextUid !== prevUid) {
    loadAll()
  }
})
</script>
