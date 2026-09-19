import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch } from 'wouter';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { RadioProvider } from './contexts/RadioContext';
import SiteShell from './components/SiteShell';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Post from './pages/Post';
import Editor from './pages/Editor';
import Sponsors from './pages/Sponsors';
import Louvores from './pages/Louvores';
import LouvoresAdmin from './pages/LouvoresAdmin';
import AnnouncementsAdmin from './pages/AnnouncementsAdmin';
import SiteContentAdmin from './pages/SiteContentAdmin';
import TestimonialsAdmin from './pages/TestimonialsAdmin';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import SponsorsAdmin from './pages/SponsorsAdmin';
import HomeBuilder from './pages/HomeBuilder';
import NotFound from './pages/NotFound';
function Router(){return <Switch><Route path="/" component={Home}/><Route path="/blog" component={Blog}/><Route path="/post/:slug" component={Post}/><Route path="/sponsors" component={Sponsors}/><Route path="/louvores" component={Louvores}/><Route path="/admin" component={AdminDashboard}/><Route path="/admin/login" component={AdminLogin}/><Route path="/admin/layout" component={HomeBuilder}/><Route path="/admin/editor" component={Editor}/><Route path="/admin/louvores" component={LouvoresAdmin}/><Route path="/admin/patrocinadores" component={SponsorsAdmin}/><Route path="/admin/avisos" component={AnnouncementsAdmin}/><Route path="/admin/textos" component={SiteContentAdmin}/><Route path="/admin/testemunhos" component={TestimonialsAdmin}/><Route component={NotFound}/></Switch>}
export default function App(){return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster/><RadioProvider><SiteShell><Router/></SiteShell></RadioProvider></TooltipProvider></ThemeProvider></ErrorBoundary>}
