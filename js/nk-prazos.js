/* NKLUCILAN — regras compartilhadas de prazos.
   Datas do Supabase são YYYY-MM-DD: comparar o texto evita problemas de UTC. */
(function (raiz) {
    'use strict';

    function hojeISO() {
        // A aba Atrasados também usa a data civil de Brasília.
        const partes = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(new Date());
        const valores = Object.fromEntries(partes.map(parte => [parte.type, parte.value]));
        return `${valores.year}-${valores.month}-${valores.day}`;
    }

    function pendenteNoCalendario(item, hoje = hojeISO()) {
        if (!item || !item.data) return false;
        // Provas não têm um campo de conclusão no banco atual; uma prova
        // de data passada permanece no histórico de "Realizadas", não na agenda.
        return item.data >= hoje && !item.concluida && !item.concluido;
    }

    raiz.NKPrazos = Object.freeze({ hojeISO, pendenteNoCalendario });
})(window);
