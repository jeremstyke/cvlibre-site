/* 21 nov 2026 (Jeremy) : partenaire NordVPN (lien affilié) dans les articles. Jamais pour les détenteurs du Pass (aucune pub).
   Chargé par assets/consent.js. Chaque version du site a sa propre source pour le suivi NordVPN. */
(function () {
  function run() { try {
    var art = document.querySelector("article.prose"); if (!art || document.getElementById("cvl-vpn")) return;
    var p = location.pathname, m = p.match(/^\/(en|us|ca|au|nz|de)\//), c = m ? m[1] : "fr";
    var L = c === "fr" ? "fr" : c === "de" ? "de" : "en";
    var T = {
      fr: ["Partenaire recommandé", "Vous postulez en ligne ? Protégez vos données.", "CV, pièces d'identité, coordonnées : sur un Wi-Fi public (café, gare, bibliothèque), vos envois peuvent être espionnés. NordVPN chiffre votre connexion et masque votre adresse IP.", "Protéger ma connexion avec NordVPN", "Lien affilié, sans surcoût pour vous."],
      en: ["Recommended partner", "Applying for jobs online? Protect your data.", "CVs, ID documents, contact details: on public Wi-Fi (cafés, stations, libraries), what you send can be intercepted. NordVPN encrypts your connection and hides your IP address.", "Protect my connection with NordVPN", "Affiliate link, at no extra cost to you."],
      de: ["Empfohlener Partner", "Sie bewerben sich online? Schützen Sie Ihre Daten.", "Lebenslauf, Ausweis, Kontaktdaten: In öffentlichen WLANs (Café, Bahnhof, Bibliothek) können Ihre Daten mitgelesen werden. NordVPN verschlüsselt Ihre Verbindung und verbirgt Ihre IP-Adresse.", "Meine Verbindung mit NordVPN schützen", "Affiliate-Link, ohne Mehrkosten für Sie."]
    }[L];
    var url = "https://go.nordvpn.net/aff_c?offer_id=15&aff_id=155375&source=cvlibre-" + c;
    function box(id) {
      var d = document.createElement("aside"); d.id = id; d.className = "cvl-vpn";
      d.innerHTML = '<span class="s"></span><b></b><p></p><a target="_blank" rel="sponsored noopener"></a><small></small>';
      d.children[0].textContent = T[0]; d.children[1].textContent = T[1]; d.children[2].textContent = T[2];
      d.children[3].textContent = T[3]; d.children[3].href = url; d.children[4].textContent = T[4];
      return d;
    }
    var st = document.createElement("style");
    st.textContent = ".cvl-vpn{display:block;background:#1c2942;color:#fff;border-radius:14px;padding:20px 22px;margin:1.8em 0;font:15px/1.55 system-ui,-apple-system,Segoe UI,sans-serif}.cvl-vpn .s{display:block;font-size:12px;color:#aab6cf}.cvl-vpn b{display:block;font-size:19px;line-height:1.3;margin:4px 0 6px;color:#fff}.cvl-vpn p{margin:0 0 14px!important;color:#d8deeb!important;font:inherit!important}.cvl-vpn a{display:inline-block;background:#fff;color:#1c2942!important;text-decoration:none!important;font-weight:700;border-radius:10px;padding:11px 16px}.cvl-vpn a:hover{background:#e9edf6}.cvl-vpn small{display:block;margin-top:10px;font-size:12px;color:#aab6cf}";
    document.head.appendChild(st);
    var ps = art.querySelectorAll(":scope > p");
    if (ps.length > 3) ps[1].parentNode.insertBefore(box("cvl-vpn"), ps[1].nextSibling); else art.appendChild(box("cvl-vpn"));
    if (ps.length > 10) art.appendChild(box("cvl-vpn2"));
  } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
