---
layout: page
title: Luam manual
description: Choose the language of the Luam manual.
sidebar: false
aside: false
outline: false
navbar: true
footer: false
---

<script setup>
import { onMounted } from 'vue';
import { withBase } from 'vitepress';

const STORAGE_KEY = 'luam-docs-locale';
const LOCALES = ['en', 'pt-br'];

function remember(locale) {
    try {
        window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
        return;
    }
}

onMounted(() => {
    if (window.location.search.includes('picker')) {
        return;
    }

    let stored = null;

    try {
        stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
        stored = null;
    }

    if (stored !== null && LOCALES.includes(stored)) {
        window.location.replace(withBase(`/${stored}/`));
    }
});
</script>

<div class="luam-picker">
    <div class="luam-picker-header">
        <img :src="withBase('/luam-mark.svg')" alt="" width="88" height="88" aria-hidden="true">
        <h1>Luam manual</h1>
        <p>Typed Lua for Multi Theft Auto. Choose a language — English is the source language and is always complete.</p>
    </div>
    <ul class="luam-picker-options">
        <li>
            <a class="luam-picker-option" :href="withBase('/en/')" hreflang="en-US" lang="en-US" @click="remember('en')">
                <strong>English</strong>
                <span>Install the toolchain, learn the language, and ship an MTA resource.</span>
                <em>Default</em>
            </a>
        </li>
        <li>
            <a class="luam-picker-option" :href="withBase('/pt-br/')" hreflang="pt-BR" lang="pt-BR" @click="remember('pt-br')">
                <strong>Português (Brasil)</strong>
                <span>Instale as ferramentas, aprenda a linguagem e publique um resource no MTA.</span>
                <em>Tradução</em>
            </a>
        </li>
    </ul>
    <p class="luam-picker-footer">
        Your choice is remembered in this browser. Open <code>/?picker</code> to see this page again.
    </p>
</div>
