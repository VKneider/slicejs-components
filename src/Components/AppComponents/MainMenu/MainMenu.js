// MainMenu — the docs menu: a search box over the documentation TreeView.
//
// Where it lives is decided by ComponentsPage: the Layout's sidebar on wide
// screens, the Navbar's mobile panel (`panelContent`) on phones. So it has no
// position, drawer, overlay or menu button of its own — one menu button per page,
// the Navbar's.

export default class MainMenu extends HTMLElement {
   constructor(props) {
      super();
      slice.attachTemplate(this);

      this.$treeHost = this.querySelector('.slice_menu_tree_host');
      this.$searchInput = this.querySelector('.slice_menu_search_input');

      // Listener on the component's own node: cleaned up with it.
      this.$searchInput?.addEventListener('input', () => {
         this.dispatchEvent(new CustomEvent('docs-menu-search', {
            bubbles: true,
            detail: { query: this.$searchInput.value || '' }
         }));
      });

      slice.controller.setComponentProps(this, props);
      this.debuggerProps = [];
   }

   add(value) {
      this.setMenuTree(value);
   }

   setMenuTree(value) {
      if (!this.$treeHost) return;
      slice.controller.destroyByContainer(this.$treeHost);   // destroy the prior TreeView (no leak)
      this.$treeHost.innerHTML = '';
      if (value instanceof Node) this.$treeHost.appendChild(value);
   }

   setEmptyState(message = 'No components found') {
      if (!this.$treeHost) return;
      slice.controller.destroyByContainer(this.$treeHost);   // destroy a prior TreeView before clearing (no leak)
      this.$treeHost.innerHTML = '';
      const empty = document.createElement('p');
      empty.classList.add('slice_menu_empty');
      empty.textContent = message;
      this.$treeHost.appendChild(empty);
   }
}

customElements.define('slice-mainmenu', MainMenu);
