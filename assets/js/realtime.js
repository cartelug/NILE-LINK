/* ============================================================
   NILE LINK — realtime.js
   Subscribes to Supabase Realtime and fires DOM CustomEvents
   so any page can react without importing the SDK directly.

   Events dispatched on document:
     nl:new-message      detail: { conversation_id, sender_id, body, image_url, created_at }
     nl:conv-updated     detail: { id, last_msg, last_time, updated_at }
     nl:new-notification detail: { id, title, body, ... }
   ============================================================ */
window.NL = window.NL || {};
NL.rt = { channels: [] };

(function(){
  function subscribeFor(uid){
    if(!NL.sb || !uid) return;
    // Tear down any existing channels
    NL.rt.channels.forEach(c=>{ try{ NL.sb.removeChannel(c); }catch(_){} });
    NL.rt.channels = [];

    // 1. New messages in any conversation I'm part of.
    // (RLS enforces this — we filter on the client too so we only react
    //  when we're actually a participant.)
    const msgCh = NL.sb.channel('nl-messages-'+uid)
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'messages' }, async payload => {
        const m = payload.new;
        // Confirm participation
        const { data: c } = await NL.sb.from('conversations')
          .select('buyer_id,seller_id').eq('id', m.conversation_id).maybeSingle();
        if(!c) return;
        if(c.buyer_id !== uid && c.seller_id !== uid) return;
        document.dispatchEvent(new CustomEvent('nl:new-message', { detail: m }));
      })
      .subscribe();
    NL.rt.channels.push(msgCh);

    // 2. Conversation summary changes (last_msg / unread counters)
    const convCh = NL.sb.channel('nl-conv-'+uid)
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'conversations' }, payload => {
        const c = payload.new;
        if(c.buyer_id !== uid && c.seller_id !== uid) return;
        document.dispatchEvent(new CustomEvent('nl:conv-updated', { detail: c }));
      })
      .subscribe();
    NL.rt.channels.push(convCh);

    // 3. New notifications for me
    const notifCh = NL.sb.channel('nl-notif-'+uid)
      .on('postgres_changes',
        { event:'INSERT', schema:'public', table:'notifications', filter:`user_id=eq.${uid}` },
        payload => { document.dispatchEvent(new CustomEvent('nl:new-notification', { detail: payload.new })); }
      )
      .subscribe();
    NL.rt.channels.push(notifCh);
  }

  document.addEventListener('nl:sb-ready', async ()=>{
    if(!NL.sb) return;
    const { data } = await NL.sb.auth.getUser();
    const uid = data && data.user ? data.user.id : null;
    subscribeFor(uid);
  });
})();
