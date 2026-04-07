import React from 'react';
import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useMyListings } from '../../hooks/useMyListings';
import { useConversations } from '../../hooks/useConversations';
import ConversationItem from '../../components/conversationItem/ConversationItem';
import './ProfileOverviewPage.scss';

const ProfileOverviewPage: React.FC = () => {
  const { userId } = useAuth();

  const { data: myListings, isLoading: listingsLoading } = useMyListings();
  const { data: conversations, isLoading: convsLoading } = useConversations();

  const recentListings = myListings?.slice(0, 3) ?? [];
  const recentConversations = conversations?.slice(0, 3) ?? [];
  const hasListings = !listingsLoading && recentListings.length > 0;
  const hasConversations = !convsLoading && recentConversations.length > 0;

  return (
    <div className="profileOverview">
      <div className="overviewGrid">

        {/* Recent Activity */}
        <section className="overviewCard">
          <div className="cardHeader">
            <div className="cardIcon cardIcon--activity">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2v4M10 14v4M2 10h4M14 10h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.75"/>
              </svg>
            </div>
            <div>
              <h3>Recent Activity</h3>
              <p className="cardSubtitle">Your latest listing actions</p>
            </div>
          </div>
          <div className="cardBody">
            {listingsLoading && (
              <div className="listingsList">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeletonRow">
                    <div className="skeletonThumb" />
                    <div className="skeletonText" />
                  </div>
                ))}
              </div>
            )}

            {!listingsLoading && !hasListings && (
              <>
                <div className="emptyIllustration emptyIllustration--activity">
                  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="10" width="64" height="40" rx="6" fill="#f4f1ed" stroke="#e8e2dc" strokeWidth="1.5"/>
                    <rect x="16" y="20" width="24" height="3" rx="1.5" fill="#e0d8d0"/>
                    <rect x="16" y="27" width="40" height="2" rx="1" fill="#e8e4de"/>
                    <rect x="16" y="33" width="32" height="2" rx="1" fill="#e8e4de"/>
                    <circle cx="60" cy="22" r="6" fill="#f4f1ed" stroke="#e8e2dc" strokeWidth="1.5"/>
                    <path d="M57 22l2 2 4-4" stroke="#c4b8ae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="emptyTitle">Nothing here yet</p>
                <p className="emptyDesc">When you create or edit listings, your recent actions will appear here.</p>
                <Link to="/listings/new" className="cardCta cardCta--outline">
                  Create a listing
                </Link>
              </>
            )}

            {hasListings && (
              <>
                <div className="listingsList">
                  {recentListings.map(listing => {
                    const thumb = listing.images[0]?.url;
                    return (
                      <div key={listing.id} className="listingRow">
                        {thumb
                          ? <img src={thumb} alt={listing.title} className="listingRowThumb" />
                          : <div className="listingRowThumb" />
                        }
                        <div className="listingRowInfo">
                          <Link to={`/listings/${listing.id}`} className="listingRowTitle">
                            {listing.title}
                          </Link>
                          <span className="listingRowMeta">{listing.city}</span>
                        </div>
                        <span className="listingRowPrice">
                          ${listing.price.toLocaleString()}
                        </span>
                        <Link
                          to={`/listings/${listing.id}/edit`}
                          className="listingRowEdit"
                          title="Edit listing"
                        >
                          <Pencil size={14} />
                        </Link>
                      </div>
                    );
                  })}
                </div>
                <Link to="/profile/listings" className="viewAllLink">
                  View all listings →
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Recent Messages */}
        <section className="overviewCard">
          <div className="cardHeader">
            <div className="cardIcon cardIcon--messages">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H7l-4 3V5z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3>Messages</h3>
              <p className="cardSubtitle">Recent conversations</p>
            </div>
          </div>
          <div className="cardBody">
            {convsLoading && (
              <div className="listingsList">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeletonRow">
                    <div className="skeletonThumb skeletonThumb--round" />
                    <div className="skeletonText" />
                  </div>
                ))}
              </div>
            )}

            {!convsLoading && !hasConversations && (
              <>
                <div className="emptyIllustration emptyIllustration--messages">
                  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="8" width="44" height="28" rx="6" fill="#f0f7f2" stroke="#cce0d4" strokeWidth="1.5"/>
                    <rect x="16" y="18" width="28" height="2.5" rx="1.25" fill="#c0d9c9"/>
                    <rect x="16" y="24" width="20" height="2" rx="1" fill="#d5e8de"/>
                    <rect x="28" y="38" width="44" height="16" rx="5" fill="#f4f1ed" stroke="#e8e2dc" strokeWidth="1.5"/>
                    <rect x="34" y="43" width="24" height="2" rx="1" fill="#e0d8d0"/>
                    <rect x="34" y="48" width="16" height="2" rx="1" fill="#e8e4de"/>
                  </svg>
                </div>
                <p className="emptyTitle">No messages yet</p>
                <p className="emptyDesc">When buyers reach out about your listings, conversations will show up here.</p>
                <Link to="/messages" className="cardCta cardCta--filled">
                  Go to Messages
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </>
            )}

            {hasConversations && (
              <>
                <div className="conversationsList">
                  {recentConversations.map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      currentUserId={userId ?? ''}
                      onClick={() => window.location.href = `/messages/${conv.id}`}
                    />
                  ))}
                </div>
                <Link to="/messages" className="viewAllLink">
                  Go to all messages →
                </Link>
              </>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default ProfileOverviewPage;
