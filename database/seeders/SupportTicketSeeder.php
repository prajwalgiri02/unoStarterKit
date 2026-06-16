<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\SupportTicketStatus;
use App\Enums\SupportTicketType;
use App\Models\SupportTicket;
use Illuminate\Database\Seeder;

class SupportTicketSeeder extends Seeder
{
    public function run(): void
    {
        $tickets = [
            [
                'name' => 'Mary Williams',
                'email' => 'm.williams@gmail.com',
                'message' => 'Hello, I am having trouble accessing my account. Every time I try to log in, I get an error message saying my credentials are invalid even though I have just reset my password. Could you please help me resolve this issue as soon as possible?',
                'type' => SupportTicketType::ContactUs,
                'status' => SupportTicketStatus::Pending,
                'created_at' => now()->subDays(1),
            ],
            [
                'name' => 'Jack Thompson',
                'email' => 'j.thompson@gmail.com',
                'message' => 'I placed an order last week and noticed that the seller has not shipped my item yet. I have tried contacting them directly but got no response. I would like to open a formal dispute and request a refund for the undelivered item.',
                'type' => SupportTicketType::Dispute,
                'status' => SupportTicketStatus::Pending,
                'created_at' => now()->subDays(2),
            ],
            [
                'name' => 'Zoe Graham',
                'email' => 'z.graham@gmail.com',
                'message' => 'I am reaching out to ask about the community guidelines regarding content moderation. I recently had a post removed and I was not provided with any explanation. Can you clarify what rule was violated so I can understand what is and is not allowed?',
                'type' => SupportTicketType::ContactUs,
                'status' => SupportTicketStatus::Pending,
                'created_at' => now()->subDays(3),
            ],
            [
                'name' => 'Zoe Graham',
                'email' => 'z.graham@gmail.com',
                'message' => 'The seller sent me the wrong item. I ordered a blue jacket in size medium but received a red one in a completely different size. I have photos as evidence and would like to dispute this transaction for a full refund or correct replacement.',
                'type' => SupportTicketType::Dispute,
                'status' => SupportTicketStatus::Pending,
                'created_at' => now()->subDays(4),
            ],
            [
                'name' => 'Zoe Graham',
                'email' => 'z.graham@gmail.com',
                'message' => 'I would like to update the email address associated with my account. I no longer have access to the old email and need to use a new one. Please advise on the steps I need to take to complete this change securely.',
                'type' => SupportTicketType::ContactUs,
                'status' => SupportTicketStatus::Pending,
                'created_at' => now()->subDays(5),
            ],
            [
                'name' => 'Zoe Graham',
                'email' => 'z.graham@gmail.com',
                'message' => 'I paid for an item two weeks ago and the seller claimed it was shipped, but I have never received it and the tracking number shows no movement. I want to file a dispute to get my money back.',
                'type' => SupportTicketType::Dispute,
                'status' => SupportTicketStatus::Pending,
                'created_at' => now()->subDays(6),
            ],
            [
                'name' => 'Zoe Graham',
                'email' => 'z.graham@gmail.com',
                'message' => 'I am interested in becoming a verified seller on the platform. Could you provide me with information on the requirements and the process to apply? I have been a buyer for over a year and would like to start selling.',
                'type' => SupportTicketType::ContactUs,
                'status' => SupportTicketStatus::Pending,
                'created_at' => now()->subDays(7),
            ],
            [
                'name' => 'Zoe Graham',
                'email' => 'z.graham@gmail.com',
                'message' => 'My payment was deducted from my bank account but the order status still shows as unpaid. I am concerned that the transaction did not go through properly. Please help me confirm the payment and update the order status.',
                'type' => SupportTicketType::ContactUs,
                'status' => SupportTicketStatus::Pending,
                'created_at' => now()->subDays(8),
            ],
            [
                'name' => 'Zoe Graham',
                'email' => 'z.graham@gmail.com',
                'message' => 'I received a damaged item from the seller. The packaging appeared to have been tampered with and the product inside was broken. I have photographs of both the packaging and the damaged item. I want to escalate this as a dispute.',
                'type' => SupportTicketType::Dispute,
                'status' => SupportTicketStatus::Resolved,
                'resolved_at' => now()->subDays(1),
                'created_at' => now()->subDays(10),
            ],
            [
                'name' => 'Zoe Graham',
                'email' => 'z.graham@gmail.com',
                'message' => 'I have noticed several unauthorized login attempts on my account. I have already changed my password but I am still concerned about account security. Is there a way to enable two-factor authentication or review my recent login history?',
                'type' => SupportTicketType::ContactUs,
                'status' => SupportTicketStatus::Resolved,
                'resolved_at' => now()->subDays(1),
                'created_at' => now()->subDays(11),
            ],
            [
                'name' => 'Zoe Graham',
                'email' => 'z.graham@gmail.com',
                'message' => 'The seller has been unresponsive for over two weeks and has not shipped my order. I have already paid in full and cannot get a reply through the platform messaging system. I would like to dispute this and get a refund immediately.',
                'type' => SupportTicketType::Dispute,
                'status' => SupportTicketStatus::Resolved,
                'resolved_at' => now()->subDays(2),
                'created_at' => now()->subDays(12),
            ],
            [
                'name' => 'Zoe Graham',
                'email' => 'z.graham@gmail.com',
                'message' => 'I accidentally created two accounts with different email addresses and would like to merge them into one. My purchase history and reviews are split between the two accounts. Is it possible to consolidate everything under a single profile?',
                'type' => SupportTicketType::Dispute,
                'status' => SupportTicketStatus::Resolved,
                'resolved_at' => now()->subDays(2),
                'created_at' => now()->subDays(13),
            ],
            [
                'name' => 'Zoe Graham',
                'email' => 'z.graham@gmail.com',
                'message' => 'I was charged twice for the same transaction. I can see two identical charges on my bank statement dated the same day. I have not received any confirmation email for the duplicate charge and would like it reversed immediately.',
                'type' => SupportTicketType::Dispute,
                'status' => SupportTicketStatus::Resolved,
                'resolved_at' => now()->subDays(3),
                'created_at' => now()->subDays(14),
            ],
            [
                'name' => 'Zoe Graham',
                'email' => 'z.graham@gmail.com',
                'message' => 'I would like to report a seller whose profile appears to be fraudulent. They have multiple listings for high-value items at suspiciously low prices and their account was only created very recently. I wanted to flag this before other users get scammed.',
                'type' => SupportTicketType::ContactUs,
                'status' => SupportTicketStatus::Resolved,
                'resolved_at' => now()->subDays(3),
                'created_at' => now()->subDays(15),
            ],
        ];

        foreach ($tickets as $ticket) {
            SupportTicket::create($ticket);
        }
    }
}
