// TourDemo: a reusable workspace fixture shared by the two TourService docs scenarios.
// All tour targets are instance-local; two demos can coexist without selector collisions.
export default class TourDemo extends HTMLElement {
   static props = {
      tour: { type: 'string', default: 'overview', allowedValues: ['overview', 'interactive'] },
      // Docs examples replace the built-in tour without duplicating the workspace.
      onLaunch: { type: 'function', default: null },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.$filters = this.querySelector('.slice-tour-demo__filters');
      this.$feedback = this.querySelector('.slice-tour-demo__feedback');
      this.$results = this.querySelector('.slice-tour-demo__results');
      this._owned = [];
      this._projectEntries = [];
      this._mounted = false;
      this._dead = false;
      this._query = '';
      this._statusValue = 'all';
      slice.controller.setComponentProps(this, props);
   }

   get tour() { return this._tour; }
   get onLaunch() { return this._onLaunch; }
   set onLaunch(fn) { this._onLaunch = typeof fn === 'function' ? fn : null; }
   // Public handles so docs code can build a tour against the workspace itself.
   get targets() {
      return {
         nav: this.querySelector('.slice-tour-demo__nav'),
         metrics: this._metrics,
         create: this._createButton,
         projects: this._projects,
         filters: this.$filters,
         filtersButton: this._filterButton,
         status: this._status,
         export: this._exportButton,
      };
   }
   set tour(value) {
      this._tour = this.constructor.props.tour.allowedValues.includes(value) ? value : 'overview';
      this.querySelector('.slice-tour-demo__demo-title').textContent = this._tour === 'overview' ? 'Meet your workspace' : 'Find your focus';
      this.querySelector('.slice-tour-demo__demo-copy').textContent = this._tour === 'overview'
         ? 'A guided introduction to the places your team uses every day.'
         : 'A hands-on walkthrough: open the filters, explore your projects, then export your view.';
      if (this._launchButton) this._launchButton.value = this._tour === 'overview' ? 'Take the tour' : 'Try the interactive tour';
   }

   async _build(name, props, slot) {
      if (this._dead) throw new DOMException('Demo destroyed', 'AbortError');
      const child = await slice.build(name, props);
      if (!child) throw new Error(`TourDemo requires ${name} in the registry.`);
      if (this._dead) { slice.controller.destroyComponent(child); throw new DOMException('Demo destroyed', 'AbortError'); }
      this._owned.push(child);
      if (slot) this.querySelector(`.slice-tour-demo__${slot}`).append(child);
      return child;
   }

   async init() {
      this._tourService = await slice.build('TourService', { singleton: true, sliceId: 'docsTour' });
      if (this._dead) return;
      await this._build('Icon', { name: 'layers', size: '20px', color: 'currentColor' }, 'brand-icon');
      await this._build('Badge', { label: 'Team plan', tone: 'accent', size: 'sm' }, 'plan');
      await this._build('Badge', { label: 'All systems go', tone: 'success', indicator: true, size: 'sm' }, 'profile');
      await this._build('Avatar', { name: 'Alex Morgan', size: 'sm' }, 'profile');
      for (const [label, icon, active] of [['Overview', 'grid', true], ['Projects', 'folder', false], ['Team', 'users', false]]) {
         await this._build('Button', { value: label, icon: { name: icon }, size: 'sm', variant: active ? 'soft' : 'ghost',
            onClick: () => { this.$feedback.textContent = `${label} selected · You are exploring sample data.`; } }, 'nav-items');
      }
      this._launchButton = await this._build('Button', { value: this._tour === 'overview' ? 'Take the tour' : 'Try the interactive tour', icon: { name: 'play' }, size: 'sm', onClick: () => this.launch() }, 'launch');
      this._createButton = await this._build('Button', { value: 'New project', icon: { name: 'plus' }, size: 'sm', onClick: () => { this.$feedback.textContent = 'Your next project starts here. This demo keeps your real workspace untouched.'; } }, 'create');
      const metrics = [];
      for (const [label, value, note] of [['Active projects', '12', '+2 launched this month'], ['Tasks completed', '86', '18 more than last week'], ['Team members', '8', 'Working better together']]) {
         const content = document.createElement('div');
         const number = document.createElement('strong'); number.className = 'slice-tour-demo__metric-value'; number.textContent = value;
         const detail = document.createElement('p'); detail.className = 'slice-tour-demo__metric-note'; detail.textContent = note;
         content.append(number, detail);
         metrics.push(await this._build('Card', { title: label, content, variant: 'outlined', size: 'sm', interactive: false }));
      }
      this._metrics = await this._build('Grid', { columns: { 0: 1, 460: 3 }, gap: 12, items: metrics }, 'metrics');
      this._filterButton = await this._build('Button', { value: 'Filters', variant: 'outlined', icon: { name: 'filter' }, size: 'sm', onClick: () => this.toggleFilters() }, 'filters-toggle');
      this._filterButton.$button.setAttribute('aria-expanded', 'false');
      this.$filters.id = `${this.sliceId}-filters`;
      this._filterButton.$button.setAttribute('aria-controls', this.$filters.id);
      this._search = await this._build('Input', { label: 'Search projects', placeholder: 'Name or keyword…', onChange: value => { this._query = String(value || ''); this._filterProjects(); } }, 'search');
      this._status = await this._build('Select', { label: 'Project status', selected: 'all', options: [{ label: 'All projects', value: 'all' }, { label: 'In progress', value: 'active' }, { label: 'In review', value: 'review' }], onChange: value => { this._statusValue = value || 'all'; this._filterProjects(); } }, 'status-filter');
      await this._build('Button', { value: 'Clear', size: 'sm', variant: 'ghost', onClick: () => this.clearFilters() }, 'clear');
      const projects = [];
      for (const [title, text, status, tone, owner, due] of [
         ['Website redesign', 'A fresh home for our next chapter.', 'active', 'accent', 'Alex Morgan', 'Nov 24'],
         ['Mobile experience', 'Thoughtful details for life on the go.', 'review', 'warning', 'Sam Rivera', 'Nov 20'],
         ['Brand foundations', 'One clear voice across every touchpoint.', 'active', 'info', 'Jordan Lee', 'Dec 02'],
      ]) {
         const content = document.createElement('div'); content.className = 'slice-tour-demo__project-detail';
         const badge = await this._build('Badge', { label: status === 'review' ? 'In review' : 'In progress', tone, size: 'sm' });
         const meta = document.createElement('div'); meta.className = 'slice-tour-demo__project-meta';
         const avatar = await this._build('Avatar', { name: owner, size: 'sm' });
         const date = document.createElement('span'); date.textContent = `Due ${due}`; meta.append(avatar, date);
         const progress = await this._build('ProgressBar', { label: `${title} completion`, value: status === 'review' ? 90 : title === 'Website redesign' ? 64 : 38, showValue: true, size: 'sm', tone: status === 'review' ? 'warning' : 'accent' });
         content.append(badge, progress, meta);
         const card = await this._build('Card', { title, text, content, variant: 'outlined', size: 'sm', interactive: false });
         projects.push(card); this._projectEntries.push({ title, text, status, card });
      }
      this._projects = await this._build('Grid', { columns: { 0: 1, 650: 3 }, gap: 12, items: projects }, 'project-grid');
      await this._build('Badge', { label: 'On the calendar', tone: 'success', size: 'sm' }, 'review-state');
      this._exportButton = await this._build('Button', { value: 'Export summary', variant: 'ghost', icon: { name: 'download' }, size: 'sm', onClick: () => this.exportSummary() }, 'export');
      this._mounted = true;
      this._filterProjects();
   }

   toggleFilters(force) {
      const open = typeof force === 'boolean' ? force : this.$filters.hidden;
      this.$filters.hidden = !open;
      this._filterButton?.$button.setAttribute('aria-expanded', String(open));
   }

   clearFilters() {
      this._query = ''; this._statusValue = 'all';
      if (this._search) this._search.value = '';
      if (this._status) this._status.selected = 'all';
      this._filterProjects();
   }

   _filterProjects() {
      const query = this._query.toLowerCase();
      let shown = 0;
      for (const item of this._projectEntries) {
         const matches = (this._statusValue === 'all' || item.status === this._statusValue) && `${item.title} ${item.text}`.toLowerCase().includes(query);
         // Grid appends the cards themselves (no wrapper), so hide the card. Hiding
         // parentElement would hide the whole grid for the first non-match.
         item.card.hidden = !matches;
         if (matches) shown++;
      }
      this.$results.textContent = shown ? `${shown} sample projects · Updated just now` : 'No projects match. Clear the filters to see all projects.';
   }

   exportSummary() {
      const shown = this._projectEntries.filter(item => !item.card.hidden).map(item => item.title);
      this.$feedback.textContent = `Summary ready: ${shown.length} projects — ${shown.join(', ')}.`;
   }

   // The docs pass their own tour here; without it the fixture keeps its built-in tours.
   launch() {
      if (!this._mounted || this._dead) return Promise.resolve({ completed: false, reason: 'stopped' });
      return this._onLaunch ? this._onLaunch(this) : this.startTour();
   }

   startTour(kind = this._tour) {
      if (!this._mounted || this._dead || !this._tourService) return Promise.resolve({ completed: false, reason: 'stopped' });
      this._tourService.stop('replaced');
      this.clearFilters(); this.toggleFilters(false);
      const data = { demo: this.sliceId };
      const steps = kind === 'interactive' ? [
         { target: () => this.$filters.hidden ? null : this.$filters, anchor: this._filterButton, waitFor: () => !this.$filters.hidden, interactive: true, timeout: 30000,
           title: 'Make room for what matters', content: 'Click Filters in the project toolbar. The page stays interactive while this card waits for the panel.', placement: 'top', data },
         { target: this._status, beforeStep: () => this.toggleFilters(true), interactive: true,
           title: 'Narrow your view', content: 'Choose In progress or In review. Try typing in Search projects too — the project cards update immediately.', placement: 'top', data },
         { target: this._exportButton, interactive: true, title: 'Share the essentials', content: 'Click Export summary to prepare a short summary of the projects you can see. Then finish the tour.', placement: 'top', data },
      ] : [
         { target: this.querySelector('.slice-tour-demo__nav'), fallback: 'skip', title: 'A home for your team', content: 'Projects, people and your weekly overview live together in this workspace.', placement: 'right', data },
         { target: this._metrics, title: 'See the big picture', content: 'Keep an eye on active projects, completed tasks and the people moving your work forward.', placement: 'bottom', data },
         { target: this._createButton, title: 'Give your next idea a home', content: 'Start a project here. Your team can add tasks and work together as it takes shape.', placement: 'bottom', data },
         { target: this._projects, title: 'Pick up where you left off', content: 'Each card brings together a project’s purpose, status, owner and next deadline.', placement: 'top', data },
      ];
      return this._tourService.start(steps, { maxCardWidth: 340,
         onEnd: ({ completed }) => { if (!this._dead) this.$feedback.textContent = completed ? 'You’re ready to explore. Replay the tour whenever you like.' : 'Tour closed. Your workspace is ready to explore.'; },
      });
   }

   beforeDestroy() {
      this._dead = true;
      if (this._tourService?.currentStep?.data?.demo === this.sliceId) this._tourService.stop();
      for (const child of this._owned.reverse()) {
         if (slice.controller.activeComponents.has(child.sliceId)) slice.controller.destroyComponent(child);
      }
      this._owned = [];
   }
}
customElements.define('slice-tour-demo', TourDemo);
