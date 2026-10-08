import type { SeedArticle } from './types';

export const EN: SeedArticle[] = [
    {
        category: 'getting-started',
        slug: 'create-account',
        position: 1,
        title: 'How to create a WorkZora account',
        summary: 'Learn how to sign up, choose your account type, and start using the platform.',
        body: `<h2>1. Click "Sign up"</h2>
<p>Open the WorkZora home page and click <strong>Sign up</strong> in the top right corner.</p>
<h2>2. Choose your account type</h2>
<ul><li><p><strong>Client</strong> if you want to post projects and hire specialists.</p></li><li><p><strong>Freelancer</strong> if you want to find projects and offer your services.</p></li></ul>
<p>You can switch the role later in your profile menu, but not more often than once every 7 days.</p>
<h2>3. Enter your basic information</h2>
<p>Fill in your name, email and password. The password needs at least 8 characters, an uppercase letter, a digit and a special character. You can also sign up with Google.</p>
<h2>4. Confirm your email</h2>
<p>We send a confirmation code to your email. Enter it in the registration form. The code is valid for 2 minutes, after that you can request a new one.</p>
<h2>5. Complete your profile</h2>
<p>Add a photo, a short bio and your skills. A complete profile gets more trust from other users.</p>
<blockquote><p><strong>Tip</strong></p><p>Use an email you have access to. Codes for password recovery are also sent there.</p></blockquote>`,
    },
    {
        category: 'getting-started',
        slug: 'choose-account-type',
        position: 2,
        title: 'How to choose your account type',
        summary: 'Understand the difference between a client account and a freelancer account.',
        body: `<p>Every WorkZora account works in one of two roles.</p>
<h2>Client</h2>
<ul><li><p>posts projects with a budget and a description;</p></li><li><p>receives proposals from freelancers and chooses a performer;</p></li><li><p>pays for the project to escrow and releases the money after the work is done.</p></li></ul>
<h2>Freelancer</h2>
<ul><li><p>fills in a profile with skills, specializations, rate and portfolio;</p></li><li><p>finds projects and sends proposals;</p></li><li><p>gets paid to the WorkZora wallet and withdraws money to a card.</p></li></ul>
<h2>Switching the role</h2>
<p>Use the <strong>Client account</strong> / <strong>Freelancer account</strong> switch in the profile menu. A switch is possible once every 7 days and only when you have no active deals.</p>`,
    },
    {
        category: 'getting-started',
        slug: 'complete-profile',
        position: 3,
        title: 'How to complete your profile',
        summary: 'Add your photo, name, bio, skills, portfolio, rate and work preferences.',
        body: `<p>Open <strong>Profile</strong> and click <strong>Edit profile</strong>. The progress card shows how complete your profile is.</p>
<h2>What to fill in</h2>
<ul><li><p><strong>Basic info</strong>: name, username, country, city and phone.</p></li><li><p><strong>Skills</strong>: up to 15 skills and up to 5 specializations. Clients find freelancers in the Top freelancers list by specializations.</p></li><li><p><strong>Hourly rate</strong> and a short note about how you work.</p></li><li><p><strong>Portfolio</strong>: works with a cover, description and tags.</p></li><li><p><strong>Work preferences</strong>: project type, budget range and work format.</p></li></ul>
<p>Click <strong>Save</strong> when you are done.</p>`,
    },
    {
        category: 'getting-started',
        slug: 'verify-email',
        position: 4,
        title: 'How to verify your email address',
        summary: 'Confirm your email to activate the account and receive important messages.',
        body: `<p>Email confirmation is part of the registration.</p>
<ul><li><p>After you submit the form, we send a code to your email.</p></li><li><p>Enter the code on the confirmation step. It is valid for 2 minutes.</p></li><li><p>If the code expired, request a new one with the resend button.</p></li></ul>
<blockquote><p><strong>No email?</strong></p><p>Check the spam and promotions folders. Make sure the address was typed correctly.</p></blockquote>`,
    },
    {
        category: 'getting-started',
        slug: 'profile-photo',
        position: 5,
        title: 'How to set up your profile photo',
        summary: 'Upload a clear photo that helps other users recognize you.',
        body: `<p>Open <strong>Edit profile</strong> and click the photo in the Basic info section.</p>
<ul><li><p>Choose an image file from your device.</p></li><li><p>Use a clear photo of your face or a company logo for clients.</p></li><li><p>To remove the photo, use the delete button next to it.</p></li></ul>
<p>The photo is shown on your public profile, in chats and in the top lists.</p>`,
    },
    {
        category: 'getting-started',
        slug: 'navigate-dashboard',
        position: 6,
        title: 'How to navigate your account',
        summary: 'Learn where to find your projects, messages, profile settings and notifications.',
        body: `<p>Open the menu under your name in the header or the side menu on the profile page.</p>
<ul><li><p><strong>Profile</strong>: your page, stats and reviews.</p></li><li><p><strong>Chat</strong>: active projects, conversations and blocked users.</p></li><li><p><strong>Projects</strong> for clients and <strong>Finances</strong> for freelancers.</p></li><li><p><strong>Security</strong>: identity verification.</p></li><li><p><strong>Notifications</strong>: all updates about proposals, payments and deals.</p></li><li><p><strong>Support</strong>: your requests to the WorkZora team.</p></li></ul>`,
    },
    {
        category: 'getting-started',
        slug: 'use-search',
        position: 7,
        title: 'How to use search on WorkZora',
        summary: 'Find projects, freelancers, clients and help articles with search and filters.',
        body: `<h2>Projects</h2>
<p>On <strong>Find work</strong> filter projects by category and specialization, tags and budget. <strong>Top projects</strong> shows featured and most viewed projects.</p>
<h2>Freelancers and clients</h2>
<p><strong>Top freelancers</strong> can be filtered by category and specialization, <strong>Top clients</strong> by rating. Both lists have a search by name.</p>
<h2>Help and blog</h2>
<p>The knowledge base and the blog have their own search fields at the top of the page.</p>`,
    },
    {
        category: 'getting-started',
        slug: 'update-account-settings',
        position: 8,
        title: 'How to update your account settings',
        summary: 'Change your personal information, password and profile details.',
        body: `<ul><li><p>Personal data, skills and preferences are changed in <strong>Edit profile</strong>.</p></li><li><p>To change the password, use <strong>Forgot password</strong> on the login page. We send a code to your email, it is valid for 15 minutes.</p></li><li><p>Payment cards are managed in <strong>Finances</strong>.</p></li></ul>`,
    },
    {
        category: 'getting-started',
        slug: 'manage-notifications',
        position: 9,
        title: 'How to manage notifications',
        summary: 'Where to see updates about messages, proposals, project status and payments.',
        body: `<p>The bell in the header shows the number of unread notifications.</p>
<ul><li><p>Open <strong>Notifications</strong> to see all updates.</p></li><li><p>Click a notification to go to the project, chat or payment it is about.</p></li><li><p>Mark notifications as read one by one or all at once.</p></li></ul>`,
    },
    {
        category: 'getting-started',
        slug: 'keep-account-safe',
        position: 10,
        title: 'How to keep your account safe',
        summary: 'Use a strong password, check suspicious messages and follow basic safety rules.',
        body: `<ul><li><p>Use a unique password with letters, digits and special characters.</p></li><li><p>Never share confirmation codes. WorkZora support never asks for them.</p></li><li><p>Keep all payments inside WorkZora. Money in escrow is protected, transfers outside the platform are not.</p></li><li><p>Block users who send spam or suspicious links. Blocked users cannot write to you or send proposals to your projects.</p></li></ul>`,
    },
    {
        category: 'getting-started',
        slug: 'how-it-works-for-clients',
        position: 11,
        title: 'How WorkZora works for clients',
        summary: 'Post a project, receive proposals, hire a freelancer and manage the work online.',
        body: `<ol><li><p>Post a project with a title, budget, up to 3 categories or specializations and a description.</p></li><li><p>Receive proposals from freelancers and compare them.</p></li><li><p>Choose a freelancer. The project waits for payment.</p></li><li><p>Pay the budget. The money is held in escrow while the work is in progress.</p></li><li><p>Accept the result. The money goes to the freelancer, and you leave a review.</p></li></ol>`,
    },
    {
        category: 'getting-started',
        slug: 'how-it-works-for-freelancers',
        position: 12,
        title: 'How WorkZora works for freelancers',
        summary: 'Create a profile, find projects, send proposals and build your reputation.',
        body: `<ol><li><p>Fill in the profile: skills, specializations, rate and portfolio.</p></li><li><p>Find projects on Find work or Top projects.</p></li><li><p>Send a proposal with your price and approach.</p></li><li><p>When the client chooses you and pays, start the work in the project chat.</p></li><li><p>After the client accepts the result, the payment minus the 8% platform fee comes to your wallet.</p></li></ol>`,
    },
    {
        category: 'getting-started',
        slug: 'after-registration',
        position: 13,
        title: 'What to do after registration',
        summary: 'The first steps after creating your account.',
        body: `<ul><li><p>Complete your profile and add a photo.</p></li><li><p>Pass identity verification in <strong>Security</strong>. Verified users get a badge.</p></li><li><p>Freelancers: add portfolio works and specializations.</p></li><li><p>Clients: post your first project.</p></li><li><p>Read the platform rules in <strong>Safety &amp; arbitration</strong>.</p></li></ul>`,
    },
    {
        category: 'getting-started',
        slug: 'beginner-mistakes',
        position: 14,
        title: 'Common beginner mistakes to avoid',
        summary: 'What new users often miss when setting up a profile or a project.',
        body: `<ul><li><p>An empty profile without a photo, bio or portfolio.</p></li><li><p>A project description of one line without a goal, scope or deadline.</p></li><li><p>Agreeing on payment outside the platform.</p></li><li><p>Starting work before the client paid to escrow.</p></li><li><p>Ignoring messages: a quick reply often decides who gets the project.</p></li></ul>`,
    },
    {
        category: 'for-clients',
        slug: 'post-a-project',
        position: 1,
        title: 'How to post a project',
        summary: 'Write a brief that attracts the right freelancers.',
        body: `<p>Click <strong>Post a project</strong> in the header.</p>
<ul><li><p><strong>Title</strong>: what needs to be done, in a few words.</p></li><li><p><strong>Budget</strong>: the maximum you are ready to pay, from $1 to $20,000.</p></li><li><p><strong>Categories</strong>: up to 3 categories or specializations.</p></li><li><p><strong>Description</strong>: the goal, scope, deadline and examples.</p></li><li><p><strong>ASAP</strong>: mark the project as urgent if you need a quick start.</p></li></ul>
<blockquote><p><strong>Tip</strong></p><p>A clear brief brings better proposals and fewer questions.</p></blockquote>`,
    },
    {
        category: 'for-clients',
        slug: 'choose-a-freelancer',
        position: 2,
        title: 'How to choose a freelancer',
        summary: 'Compare proposals, profiles, reviews and portfolios.',
        body: `<ul><li><p>Read the proposal: does the freelancer understand the task?</p></li><li><p>Open the profile: rating, reviews, completed projects and portfolio.</p></li><li><p>Ask questions in the chat before you decide.</p></li><li><p>Click the proposal you like and confirm the choice. The project waits for your payment.</p></li></ul>`,
    },
    {
        category: 'for-clients',
        slug: 'complete-and-review',
        position: 3,
        title: 'How to accept the work and leave a review',
        summary: 'Release the payment and rate the freelancer.',
        body: `<p>When the freelancer delivers the result, check it in the project chat.</p>
<ul><li><p>If everything is fine, click <strong>Complete project</strong>. The money from escrow goes to the freelancer.</p></li><li><p>Leave a review: rate quality, professionalism, communication, price and deadlines.</p></li><li><p>If you cannot agree, contact arbitration from the chat.</p></li></ul>`,
    },
    {
        category: 'for-freelancers',
        slug: 'strong-profile',
        position: 1,
        title: 'How to make a strong profile',
        summary: 'What clients look at before they hire you.',
        body: `<ul><li><p>A clear photo and a bio that says what you do and for whom.</p></li><li><p>Specializations: they decide where you appear in Top freelancers.</p></li><li><p>3 to 6 portfolio works with covers, tags and short descriptions.</p></li><li><p>An honest rate and work preferences.</p></li><li><p>Verification badge from the Security page.</p></li></ul>`,
    },
    {
        category: 'for-freelancers',
        slug: 'send-proposal',
        position: 2,
        title: 'How to send a good proposal',
        summary: 'Stand out among other freelancers.',
        body: `<ul><li><p>Read the whole brief before you reply.</p></li><li><p>Start with how you will solve the task, not with a story about yourself.</p></li><li><p>Name the price and the time you need.</p></li><li><p>Add one or two relevant works from your portfolio.</p></li><li><p>Ask a question if something in the brief is not clear.</p></li></ul>`,
    },
    {
        category: 'for-freelancers',
        slug: 'reviews-and-rating',
        position: 3,
        title: 'How reviews and rating work',
        summary: 'How your rating is formed and how to reply to reviews.',
        body: `<p>After a project is completed, the client rates your work. Your rating is the average of all reviews.</p>
<ul><li><p>You can reply to each review once. The reply is shown under the review.</p></li><li><p>You can also leave a review about the client: sociability, requirements, payment and professionalism.</p></li></ul>`,
    },
    {
        category: 'payments-escrow',
        slug: 'how-escrow-works',
        position: 1,
        title: 'How escrow works',
        summary: 'Why the money is safe for both sides.',
        body: `<ol><li><p>The client chooses a freelancer and pays the project budget.</p></li><li><p>The money is held by WorkZora while the work is in progress.</p></li><li><p>After the client completes the project, the money goes to the freelancer's wallet.</p></li><li><p>If there is a dispute, arbitration decides: refund to the client or payment to the freelancer.</p></li></ol>`,
    },
    {
        category: 'payments-escrow',
        slug: 'platform-fee',
        position: 2,
        title: 'Platform fee',
        summary: 'How much WorkZora charges and when.',
        body: `<p>WorkZora takes an 8% fee from the payment the freelancer receives. The client pays the project budget without extra fees from WorkZora.</p>
<p>Example: for a $500 project the freelancer receives $460 to the wallet.</p>`,
    },
    {
        category: 'payments-escrow',
        slug: 'withdraw-funds',
        position: 3,
        title: 'How to withdraw money',
        summary: 'Link a card and withdraw your earnings.',
        body: `<ul><li><p>Open <strong>Finances</strong> and add a card. You can link up to 5 cards and choose the primary one.</p></li><li><p>Click <strong>Withdraw</strong>, enter the amount and choose the card. The minimum is $10.</p></li><li><p>The request is checked by the WorkZora team. You can follow its status in the withdrawal history.</p></li></ul>`,
    },
    {
        category: 'projects-proposals',
        slug: 'project-statuses',
        position: 1,
        title: 'Project statuses',
        summary: 'What each status means.',
        body: `<ul><li><p><strong>Open</strong>: the project accepts proposals.</p></li><li><p><strong>Awaiting payment</strong>: the client chose a freelancer and has to pay.</p></li><li><p><strong>In progress</strong>: the money is in escrow, the work is going on.</p></li><li><p><strong>Completed</strong>: the client accepted the result, the freelancer got paid.</p></li><li><p><strong>Closed</strong>: the project was closed by the team.</p></li></ul>`,
    },
    {
        category: 'projects-proposals',
        slug: 'edit-or-delete-project',
        position: 2,
        title: 'How to edit or delete a project',
        summary: 'What can be changed after posting.',
        body: `<ul><li><p>The title, description, categories and tags can be changed at any time.</p></li><li><p>The budget can be changed only while the project is open.</p></li><li><p>A project can be deleted until it is paid.</p></li></ul>`,
    },
    {
        category: 'projects-proposals',
        slug: 'featured-and-asap',
        position: 3,
        title: 'Featured and ASAP projects',
        summary: 'What the badges on project cards mean.',
        body: `<ul><li><p><strong>ASAP</strong>: the client marked the project as urgent.</p></li><li><p><strong>Featured project</strong>: the project was selected by the WorkZora team and is shown first in Top projects.</p></li></ul>`,
    },
    {
        category: 'account-settings',
        slug: 'switch-role',
        position: 1,
        title: 'How to switch between client and freelancer',
        summary: 'Rules for changing the account role.',
        body: `<p>Use the <strong>Client account</strong> / <strong>Freelancer account</strong> switch in the profile menu.</p>
<ul><li><p>The role can be changed once every 7 days.</p></li><li><p>It is not possible while you have active deals.</p></li></ul>`,
    },
    {
        category: 'account-settings',
        slug: 'linked-cards',
        position: 2,
        title: 'How to manage payment cards',
        summary: 'Add, remove and choose the primary card.',
        body: `<ul><li><p>Cards are managed in <strong>Finances</strong>.</p></li><li><p>You can link up to 5 cards. The primary card is selected by default for withdrawals.</p></li><li><p>Use the menu next to a card to make it primary or remove it.</p></li></ul>`,
    },
    {
        category: 'account-settings',
        slug: 'block-users',
        position: 3,
        title: 'How to block a user',
        summary: 'Stop unwanted messages and proposals.',
        body: `<ul><li><p>Open the user's profile and click <strong>Block</strong>.</p></li><li><p>A blocked user cannot write to you or send proposals to your projects.</p></li><li><p>The list of blocked users is in <strong>Chat</strong>, on the Blocked tab. Unblock a user there.</p></li></ul>`,
    },
    {
        category: 'safety-arbitration',
        slug: 'open-a-dispute',
        position: 1,
        title: 'How to open a dispute',
        summary: 'What to do if you cannot agree on the result.',
        body: `<ol><li><p>Open the project chat and click <strong>Contact arbitration</strong>.</p></li><li><p>Describe the problem. Keep all agreements and files in the chat, they are used as evidence.</p></li><li><p>The WorkZora team checks the case and decides: refund to the client or payment to the freelancer.</p></li></ol>`,
    },
    {
        category: 'safety-arbitration',
        slug: 'identity-verification',
        position: 2,
        title: 'Identity verification',
        summary: 'Why verify your identity and how it works.',
        body: `<p>Open <strong>Security</strong> and follow the steps. After the check, a verification badge appears next to your name.</p>
<p>Verified users get more trust from clients and freelancers.</p>`,
    },
    {
        category: 'safety-arbitration',
        slug: 'safe-collaboration',
        position: 3,
        title: 'Rules for safe collaboration',
        summary: 'Basic rules that protect both sides.',
        body: `<ul><li><p>Agree on the scope, price and deadline in the project chat.</p></li><li><p>Pay and get paid only through WorkZora.</p></li><li><p>Do not share passwords, codes or card data in messages.</p></li><li><p>Report suspicious behavior to support.</p></li></ul>`,
    },
    {
        category: 'technical-support',
        slug: 'login-problems',
        position: 1,
        title: 'I cannot log in',
        summary: 'What to check if you cannot sign in.',
        body: `<ul><li><p>Check the email and the keyboard layout.</p></li><li><p>Reset the password with <strong>Forgot password</strong>.</p></li><li><p>After many attempts the login is paused for a minute. Wait and try again.</p></li><li><p>If you signed up with Google, use the Google button.</p></li></ul>`,
    },
    {
        category: 'technical-support',
        slug: 'contact-support',
        position: 2,
        title: 'How to contact support',
        summary: 'Send a request to the WorkZora team.',
        body: `<p>Use the <strong>Contacts</strong> page or <strong>Support</strong> in your profile menu. Describe the problem and add the project or withdrawal ID if it is about a payment. You can follow the answer in your support requests.</p>`,
    },
    {
        category: 'technical-support',
        slug: 'report-a-bug',
        position: 3,
        title: 'How to report a bug',
        summary: 'Help us fix problems faster.',
        body: `<p>Write to support and include:</p>
<ul><li><p>the page where the problem happened;</p></li><li><p>what you did and what you expected;</p></li><li><p>a screenshot, your browser and device.</p></li></ul>`,
    },
];
